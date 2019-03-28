function CategoryViewModel(name) {
    var self = this;
    self.categoryName = ko.observable(name);
    self.results = ko.observableArray();
}

function autoCompleteViewModel(location) {
    var self = this;
    self.searchLength = 2;
    self.GetTop10Url = RESTSERVICESBASE + "api/SelectedDestinations/";
    self.GetSearchUrl = RESTSERVICESBASE + "api/destination/";
    self.lookupReference = location;
    self.clientID = ko.observable().syncWith('ClientID');
    self.search_visible = ko.observable(true).syncWith('searchVisible' + self.lookupReference);
    self.results_visible = ko.observable(false);
    self.saved_name = ko.observable('');
    self.saved_value = ko.observable().syncWith('newLocation' + self.lookupReference);
    self.categoryVMs = ko.observableArray();
    self.searchType = 'top10';
    self.categories = [];
    self.topCategoryVMs = [];
    self.searchCategoryVMs = [];
    self.currentSelectedResult = ko.observable(0);
    self.visibleCount = 0;
    self.increaseCurrentResult = function () {
        self.currentSelectedResult(self.currentSelectedResult() + 1);
        if (self.currentSelectedResult() >= self.visibleCount)
            self.currentSelectedResult(self.visibleCount - 1);
    }
    self.decreaseCurrentResult = function () {
        self.currentSelectedResult(self.currentSelectedResult() - 1);
        if (self.currentSelectedResult() < 0)
            self.currentSelectedResult(0);
    }
    self.selectCurrentResult = function () {
        var counter = 0;
        for (var i = 0; i < self.categoryVMs().length; i++) {
            for (var j = 0; j < self.categoryVMs()[i].results().length; j++) {
                if (self.categoryVMs()[i].results()[j].itemVisible()) {
                    if (counter == self.currentSelectedResult()) {
                        self.changeSavedValue(i + '|' + j);
                        return;
                    }
                    counter++;
                }
            }
        }
    };
    self.pushEmptyList = function () {
        if (self.categoryVMs().length == 0) {
            self.categoryVMs.push(new CategoryViewModel('No Results Found'));
            self.results_visible(true);
        }
    };
    self.refreshList = function () {
        var funcwithdelay = $.delayInvoke(function (event) {
            try {
                $('#suggest' + self.lookupReference).listview('refresh');
            } catch (ex) { }
        }, 20);
        funcwithdelay();
    };
    self.results_visible.subscribe(function (newValue) {
        self.refreshList();
    });
    self.listHTML = ko.computed(function () {
        var html = '';
        var counter = 0;        
        for (var i = 0; i < self.categoryVMs().length; i++) {
            html += '<li data-role="list-divider" class="ui-li ui-li-divider ui-bar-b">' + self.categoryVMs()[i].categoryName() + '</li>';
            for (var j = 0; j < self.categoryVMs()[i].results().length; j++) {
                /*if ($('html').hasClass('lte8'))
                {
                    html += '<li style="' + (self.categoryVMs()[i].results()[j].itemVisible() ? '' : 'display: none;') +
                        '" class="' + (counter == self.currentSelectedResult() ? 'ui-btn-hover-a ui-btn ui-btn-up-a ui-btn-icon-right ui-li-has-arrow ui-li' : 'ui-btn ui-btn-up-a ui-btn-icon-right ui-li-has-arrow ui-li') +
                        '" onmousedown="mainVM.' + self.lookupReference + 'VM.searchVM.changeSavedValue(\'' + i + '|' + j + '\')" ><div class="ui-btn-inner ui-li"><div class="ui-btn-text"><a class="ui-link-inherit" href=\'#\'>' +
                        self.categoryVMs()[i].results()[j].DisplayName() + '</a></div></div></li>';
                } else {*/
                var tagData = '';
                if (self.categoryVMs()[i].results()[j].isSearchByTag())
                {
                    tagData = '<span style="color:#0099ff"> (' + self.categoryVMs()[i].results()[j].tagName() + ')</span>';
                }
                html += '<li style="' + (self.categoryVMs()[i].results()[j].itemVisible() ? '' : 'display: none;') +
                    '" onmousedown="mainVM.' + self.lookupReference + 'VM.searchVM.changeSavedValue(\'' + i + '|' + j + '\')" >' +
                    '<a href=\'#\' class=\'ui-btn ' + (counter == self.currentSelectedResult() ? 'listItemHover' : '') + '\'>' +
                    self.categoryVMs()[i].results()[j].DisplayName() +  tagData + '</a></li>';
                //}
                if (self.categoryVMs()[i].results()[j].itemVisible()) counter++;
            }
        }
        self.visibleCount = counter;
        self.refreshList();
        return html;
    });
    self.PopulateTop10Results = function () {
        if (self.topCategoryVMs.length == 0) {
            $.support.cors = true;
            $.ajax({
                url: self.GetTop10Url + '?ClientID=' + self.clientID() + '&Count=10' + getJsonpSuffix(),
                type: "GET",
                dataType: getJsonDataType(),
                contentType: getJsonContentType(),
                success: function (jsonObject) {
                    if (self.topCategoryVMs.length == 0) { //double fire preventer (caused duplication)
                        var topDestinations = (self.lookupReference == 'to' ? jsonObject.EndDestinations : jsonObject.StartDestinations);
                        if (topDestinations.length > 0) {
                            self.categoryVMs.push(new CategoryViewModel((self.lookupReference == 'to' ? 'Top Destinations' : 'Top Starting Locations')));
                            self.topCategoryVMs.push(self.categoryVMs()[0]);
                            for (var i = 0; i < topDestinations.length; i++) {
                                var dvm = new DestinationViewModel([]);
                                dvm.QuickLink(topDestinations[i].QuickLink);
                                dvm.name(topDestinations[i].DestinationName);
                                dvm.DisplayName(topDestinations[i].DestinationText);
                                self.categoryVMs()[0].results.push(dvm);
                            }
                        }
                        //self.pushEmptyList();
                        self.refreshList();
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    throw 'getJSON failed: ' + errorThrown + ' ' + self.GetTop10Url + '?ClientID=' + self.clientID() + '&DCount=10' + getJsonpSuffix();
                }
            });
        } else {
            self.categoryVMs.removeAll();
            for (var i = 0; i < self.topCategoryVMs.length; i++) {
                self.categoryVMs.push(self.topCategoryVMs[i]);
            }
            self.pushEmptyList();
            self.refreshList();
        }
    }

    self.tagSearchFilter = function(searchText) {
        var filterData = [];
        var categoryNames = [];
        var destinationTypeList = mainVM.tagSearchModel.AllDestinationData()
        if (searchText && searchText.length > 1) {           
            ko.utils.arrayForEach(destinationTypeList, function (destType) {
                var filterColumnNames = destType.VisibleColumnNames;
                if (destType.Destinations['english']) {
                    ko.utils.arrayForEach(destType.Destinations['english'], function (dest) {
                        for (var index = 0; index <= 1; index++) { //0 for tags and 1 for first visible column
                            var data = new DirectorySearchedTextModel();
                            if (dest[filterColumnNames[index]] && filterColumnNames[index] == 'Tags') {
                                var getTags = [];
                                getTags = ko.utils.arrayFilter(dest.Tags.split(','), function (tg) {
                                    var dataBySpace = [];
                                    var dataArrayBySpace = tg.split(/[ ]+/);
                                    while (dataArrayBySpace.length > 0) {
                                        var stringToMatch = dataArrayBySpace.join(' ');
                                        if (stringToMatch.trim().toLocaleLowerCase().startsWith(searchText.trim().toLocaleLowerCase())) {
                                            dataBySpace.push(dest[filterColumnNames[index]]);
                                            break;
                                        }
                                        dataArrayBySpace.splice(0, 1);
                                    }
                                    return dataBySpace && dataBySpace.length > 0;
                                    //if (tg.trim().toLocaleLowerCase().startsWith(searchText.trim().toLocaleLowerCase())) {
                                    //    return tg;
                                    //}
                                    //else {
                                    //    let dataBySpace = ko.utils.arrayFilter(tg.split(/[ ]+/), function (tgSpace) {
                                    //        return tgSpace.trim().toLocaleLowerCase().startsWith(searchText.trim().toLocaleLowerCase());
                                    //    });
                                    //    return dataBySpace && dataBySpace.length > 0;
                                    //}
                                    });
                                if (getTags && getTags.length > 0) {
                                    data.TagName = getTags.join(',');
                                    data.IsSearchByTag = true;
                                    data.Quicklink = dest.quicklink;
                                    data.SearchedData = dest[filterColumnNames[1]];
                                    data.CategoryName = destType.MenuLabel;
                                    data.DisplayText = dest.DisplayText;
                                    if (categoryNames.indexOf(destType.MenuLabel) == -1)
                                    {
                                        categoryNames.push(destType.MenuLabel)
                                    }
                                    filterData.push(data);
                                    break;
                                }
                            }
                            else
                                if (dest[filterColumnNames[index]] && dest[filterColumnNames[index]].toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) != -1 && dest[filterColumnNames[index]].toLocaleLowerCase().indexOf('ci_') == -1) {
                                    var dataBySpace = [];
                                    var dataArrayBySpace = dest[filterColumnNames[index]].split(/[ ]+/);
                                    while (dataArrayBySpace.length > 0) {
                                        var stringToMatch=dataArrayBySpace.join(' ');
                                        if (stringToMatch.trim().toLocaleLowerCase().startsWith(searchText.trim().toLocaleLowerCase())) {
                                            dataBySpace.push(dest[filterColumnNames[index]]);
                                            break;
                                        }
                                        dataArrayBySpace.splice(0, 1);
                                    }

                                    //if (dest[filterColumnNames[index]].trim().toLocaleLowerCase().startsWith(searchText.trim().toLocaleLowerCase())) {
                                    //    dataBySpace.push(dest[filterColumnNames[index]]);
                                    //}
                                    //else {
                                    //        dataBySpace = ko.utils.arrayFilter(dest[filterColumnNames[index]].split(/[ ]+/), function (spaceData) {
                                    //            return spaceData.trim().toLocaleLowerCase().startsWith(searchText.trim().toLocaleLowerCase());
                                    //        });
                                    //}
                                    
                                    if (dataBySpace && dataBySpace.length > 0 && filterColumnNames[index] != 'Tags') {
                                        data.IsSearchByTag = false;
                                        data.TagName = '';
                                        data.Quicklink = dest.quicklink;
                                        data.DisplayText = dest.DisplayText;
                                        data.SearchedData = dest[filterColumnNames[index]];
                                        data.CategoryName = destType.MenuLabel;
                                        if (categoryNames.indexOf(destType.MenuLabel) == -1) {
                                            categoryNames.push(destType.MenuLabel)
                                        }
                                        filterData.push(data);
                                        break;
                                    }

                                }
                        }

                    });
                }
            });
        }
        //this.destinationService.directoryFilteredDataBySearchText = filterData;
        BindToSearchModel(filterData, categoryNames);
    }

    function BindToSearchModel(filterData, categoryNames) {
        var searchVM = [];
        ko.utils.arrayForEach(categoryNames, function (category) {
            var catgoryVM = new CategoryViewModel(category)
           
            var dataByCategory = ko.utils.arrayFilter(filterData, function (item) {
                return item.CategoryName == category;
            });
            ko.utils.arrayForEach(dataByCategory, function (data) {
                var dvm = new DestinationViewModel([]);
                dvm.name(data.DisplayText);
                dvm.isSearchByTag(data.IsSearchByTag);
                dvm.tagName(data.TagName);
                dvm.DisplayName(data.SearchedData);
                dvm.QuickLink(data.Quicklink);
                dvm.itemVisible(true);
                catgoryVM.results.push(dvm);
            });
            searchVM.push(catgoryVM);
        });
        self.categories=categoryNames;
        self.categoryVMs.removeAll();
        self.categories = [];

        self.categoryVMs(searchVM);

        self.pushEmptyList();
        self.refreshList();
    }

    self.PopulateSearchResults = function (searchString) {
        self.categoryVMs.removeAll();
        self.categoryVMs.push(new CategoryViewModel('Searching ...'));
        self.tagSearchFilter(searchString);
        //if (self.searchCategoryVMs[searchString.substring(0, self.searchLength)] == null) {
        //    //self.searchCategoryVMs[searchString.substring(0, self.searchLength)] = new Array();
        //    $.support.cors = true;
        //    $.ajax({
        //        url: self.GetSearchUrl + '?ClientID=' + self.clientID() + '&SearchString=' + searchString.substring(0, self.searchLength) + getJsonpSuffix(),
        //        type: "GET",
        //        dataType: getJsonDataType(),
        //        contentType: getJsonContentType(),
        //        success: function (jsonObject) {
        //            self.searchCategoryVMs[searchString.substring(0, self.searchLength)] = null;
        //            if (Array.isArray(jsonObject)) {
        //                for (var i = 0; i < jsonObject.length; i++) {
        //                    if (jQuery.inArray(jsonObject[i].DestinationTypeLabel, self.categories) < 0) {
        //                        self.categories.push(jsonObject[i].DestinationTypeLabel);
        //                        if (self.searchCategoryVMs[searchString.substring(0, self.searchLength)] == null) {
        //                            self.searchCategoryVMs[searchString.substring(0, self.searchLength)] = new Array();
        //                        }
        //                        self.searchCategoryVMs[searchString.substring(0, self.searchLength)].push(new CategoryViewModel(jsonObject[i].DestinationTypeLabel));
        //                    }
        //                    for (var j = 0; j < self.searchCategoryVMs[searchString.substring(0, self.searchLength)].length; j++) {
        //                        if (self.searchCategoryVMs[searchString.substring(0, self.searchLength)][j].categoryName() == jsonObject[i].DestinationTypeLabel) {
        //                            var dvm = new DestinationViewModel([]);
        //                            dvm.name(jsonObject[i].UniqueName);
        //                            dvm.DisplayName(jsonObject[i].DisplayName);
        //                            dvm.QuickLink(jsonObject[i].QuickLink);
        //                            self.searchCategoryVMs[searchString.substring(0, self.searchLength)][j].results.push(dvm);
        //                        }
        //                    }
        //                }
        //            }
        //            self.RepopulateSearchArray(searchString);
        //            self.refreshList();
        //        },
        //        error: function (jqXHR, textStatus, errorThrown) {
        //            throw 'getJSON failed: ' + errorThrown + ' ' + self.GetSearchUrl + '?ClientID=' + self.clientID() + '&SearchString=' + searchString.substring(0, self.searchLength) + getJsonpSuffix();
        //        }
        //    });
        //} else {
        //    self.RepopulateSearchArray(searchString);
        //}

    }
    self.RepopulateSearchArray = function (searchString) {
        self.categoryVMs.removeAll();
        self.categories = [];
        if (self.searchCategoryVMs[searchString.substring(0, self.searchLength)]) {
            for (var i = 0; i < self.searchCategoryVMs[searchString.substring(0, self.searchLength)].length; i++) {
                var visible = false;
                for (var j = 0; j < self.searchCategoryVMs[searchString.substring(0, self.searchLength)][i].results().length; j++) {
                    if (self.searchCategoryVMs[searchString.substring(0, self.searchLength)][i].results()[j].DisplayName().toLowerCase().indexOf(searchString.toLowerCase()) == 0
                        || self.searchCategoryVMs[searchString.substring(0, self.searchLength)][i].results()[j].DisplayName().toLowerCase().indexOf(" " + searchString.toLowerCase()) >= 0
                        //&& (!self.searchCategoryVMs[searchString.substring(0, self.searchLength)][i].results()[j].isOffCampus() || self.lookupReference == 'to')
                    ) {
                        self.searchCategoryVMs[searchString.substring(0, self.searchLength)][i].results()[j].itemVisible(true);
                        visible = true;
                    } else {
                        self.searchCategoryVMs[searchString.substring(0, self.searchLength)][i].results()[j].itemVisible(false);
                    }
                }
                //self.searchCategoryVMs[i].hasVisibleItems(visible);
                if (visible) self.categoryVMs.push(self.searchCategoryVMs[searchString.substring(0, self.searchLength)][i]);
            }
        }
        self.pushEmptyList();
        self.refreshList();
    }
    self.PopulateSuggestions = function (text) {
        self.categoryVMs.removeAll();
        self.categories = [];
        if (
            text.length == 0 || text.indexOf('...') > -1 //IE8 is slow and still sees placholder as text i.e."Enter destination here or view Top Destinations ..."
        ) {
            self.searchType = 'top10'
            self.PopulateTop10Results();
        } else if (text.length >= self.searchLength) {
            self.searchType = 'search'
            self.PopulateSearchResults(text);
        }
        //self.pushEmptyList();
        self.refreshList();
    }
    self.changeSavedValue = function (code) {
        var catNum = code.split('|')[0];
        var resNum = code.split('|')[1];
        var suggestion = self.categoryVMs()[catNum].results()[resNum];
        if (suggestion.QuickLink() == "") {
            alert('Cannot get directions to this location, please try another.');
        } else {
            self.saved_value(suggestion);
            //self.saved_name(suggestion.name()); 
            self.search_visible(false);
            PushNewState(self.lookupReference + '=' + encodeURIComponent(suggestion.name().replace('#', '%23')))
            mainVM.storageObject[self.lookupReference + 'SearchType'] = self.searchType;
        }
        return false;
        //self.results_visible(false);
    }
    self.saved_name.subscribe(function (newValue) {
        var text = newValue;
        self.PopulateSuggestions(text);
    });
};