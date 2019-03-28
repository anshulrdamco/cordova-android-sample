function EventsViewModel() {
    var self = this;
    self.GetDestinationUrl = RESTSERVICESBASE + "api/destination/";
    self.headerText = ko.observable("Upcoming Events");
    self.currentDate = ko.observable(new Date());
    self.currentDay = ko.computed({ read: function () { return self.currentDate().getDate() } });
    self.currentMonth = ko.computed({ read: function () { return self.currentDate().getMonth() } });
    self.currentYear = ko.computed({ read: function () { return self.currentDate().getFullYear() } });
    self.Months = ko.observableArray([{ text: 'January', value: 0 },
										{ text: 'February', value: 1 },
										{ text: 'March', value: 2 },
										{ text: 'April', value: 3 },
										{ text: 'May', value: 4 },
										{ text: 'June', value: 5 },
										{ text: 'July', value: 6 },
										{ text: 'August', value: 7 },
										{ text: 'September', value: 8 },
										{ text: 'October', value: 9 },
										{ text: 'November', value: 10 },
										{ text: 'December', value: 11 }]);
    self.Days = ko.observableArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]);
    self.Years = ko.observableArray([2014, 2015]);
    self.Sorting = ko.observable('');
    self.StartIndex = ko.observable(0);
    self.TotalRecordCount = ko.observable(0);
    self.Columns = ko.observable(['EventTime', 'Event', '']);
    self.PageSize = ko.observable(100);
    self.EventsArray = ko.observable([]);
    self.BigMonths = [0, 2, 4, 6, 7, 9, 11];
    self.ChangeDay = function (data, event) {
        var newVal = $(event.currentTarget).val();
        self.currentDate().setDate(newVal);
        self.currentDate.valueHasMutated();
        //$( '#daySelector' ).selectmenu( "refresh", true );
    };
    self.ChangeYear = function (data, event) {
        var newVal = $(event.currentTarget).val();
        self.currentDate().setFullYear(newVal);
        self.currentDate.valueHasMutated();
        //$( '#yearSelector' ).selectmenu( "refresh", true );
    };
    self.ChangeMonth = function (data, event) {
        var newVal = $(event.currentTarget).val();
        if (self.Days().length < 31) {
            if (self.Days().length < 30) {
                if (self.Days().length < 29) {
                    self.Days.push(29);
                }
                self.Days.push(30);
            }
            self.Days.push(31);
        }
        if (newVal == 1) {
            self.Days.splice(28, 3);
        } else if (self.BigMonths.indexOf(newVal) < 0) {
            self.Days.splice(30, 1);
        }
        self.currentDate().setMonth(newVal);
        self.currentDate.valueHasMutated();
        //self.currentDay.valueHasMutated();
        //self.currentYear.valueHasMutated();
        //$( '#monthSelector' ).selectmenu( "refresh", true );
    };
    self.currentDate.subscribe(function (newVal) {
        self.StartIndex(0);
        self.redrawTable();
        //self.PopulateData();
    });
    self.Sorting.subscribe(function () {
        //self.PopulateData();
    });
    self.StartIndex.subscribe(function () {
        //self.PopulateData();
    });
    self.PageSize.subscribe(function () {
        self.StartIndex(0);
        //self.PopulateData();
    });
    self.CurrentPage = ko.computed(function () {
        return (self.StartIndex() / self.PageSize()) + 1;
    });
    self.SortBy = function (col) {

        if (!self.Sorting() && col == self.Columns()[0])
            self.Sorting(col + ' DESC');
        else if (!self.Sorting() || self.Sorting().indexOf(col + ' ') == -1)
            self.Sorting(col + ' ASC');
        else if (self.Sorting().indexOf(col + ' ') == 0) {
            if (self.Sorting().indexOf(' ASC') > -1) {
                self.Sorting(col + ' DESC');
            } else {
                self.Sorting(col + ' ASC');
            }
        }
    };
    self.SetPage = function (page) {
        self.StartIndex((page - 1) * self.PageSize());
    };

    self.indexClicked = function (index) {
        var item = self.EventsArray()[index];
        self.itemClicked(item);
    };

    self.itemClicked = function (item) {
        //TODO: Get Location Name from the database
        var locationName = "";
        $.support.cors = true;
        $.ajax({
            url: self.GetDestinationUrl + "?IsQuicklink=true&QuicklinkId=" + encodeURIComponent(item.QuickLink.replace('#', '%23')) + "&ClientID=" + mainVM.clientVM.clientID() + getJsonpSuffix(),
            type: "GET",
            dataType: getJsonDataType(),
            contentType: getJsonContentType(),
            success: function (jsonObject) {
                if (jsonObject) locationName = jsonObject.UniqueName;
                self.EventsArray([]);
                self.PageSize(100);
                self.StartIndex(0);
                mainVM.storageObject['toSearchType'] = 'events';
                PushNewState('page=home&to=' + encodeURIComponent(locationName.replace('#', '%23')));
            }
        });
    };

    self.backClick = function () {
        PushNewState('page=home');
    }

    self.PopulateEvents = function () {
        $('#events-list-div').html('');
        $.support.cors = true;
        $.ajax({
            url: mainVM.clientVM.EventXML(),
            type: "GET",
            dataType: 'xml',
            success: function (d) {
                self.EventsArray([]);
                var xml = d;
                if (!supportsCORS()) {
                    xml = jQuery.parseXML(d.data);
                }
                var data = $(xml).find("data");
                $(data).find("LJKiosk_Events").each(function () {
                    var eve = new Object();
                    for (var i = 0; i < this.attributes.length; i++) {
                        switch (this.attributes[i].name) {
                            case "starttime":
                                eve.StartTime = this.attributes[i].value;
                                break;
                            case "endtime":
                                eve.EndTime = this.attributes[i].value;
                                break;
                            case "quicklink":
                                eve.QuickLink = this.attributes[i].value;
                                break;
                            case "subject":
                                eve.EventText = this.attributes[i].value;
                                break;
                        }
                    }
                    self.EventsArray().push(eve);
                    self.redrawTable();
                });
            },
            error: function (p, a, r, m) {

            }
        });
    };

    self.redrawTable = function () {
        $('#events-list-div').html(self.tableTag + '<thead>' + self.theadHTML() + '</thead><tbody>' + self.tbodyHTML() + '</tbody><tfoot>' + self.tfootHTML() + '</tfoot></table>');
    };

    self.tableTag = '<table data-role="table" id="events-list-table" class="ui-body-d ui-shadow table-stripe ui-responsive tablesorter ui-table ui-table-reflow"  data-column-btn-theme="b" data-column-btn-text="Display" data-column-popup-theme="a" >'

    self.rowHtml = function (eventItem) {
        var html = '';
        if (eventItem) {
            html += '<td>' + new Date(0, 0, 0, eventItem.StartTime.substr(11, 2), eventItem.StartTime.substr(14, 2), eventItem.StartTime.substr(17, 2), 0).ljFormat('h:nn am') + ' to ';
            html += new Date(0, 0, 0, eventItem.EndTime.substr(11, 2), eventItem.EndTime.substr(14, 2), eventItem.EndTime.substr(17, 2), 0).ljFormat('h:nn am') + '</td>';
            html += '<td>' + eventItem.EventText + '</td>';
            if (eventItem.QuickLink) {
                html += '<td><a href=\'#\' onlick=\'return false;\'>Get Directions</a></td>';
            } else {
                html += '<td></td>';
            }
        }
        return html;
    };

    self.tbodyHTML = function () {

        var EventsArray = self.EventsArray();
        var html = '';
        var year = self.currentYear();
        var month = self.currentMonth();
        var day = self.currentDay();
        var count = 0;
        for (var d = 0; d < EventsArray.length; d++) {
            var eventYear = parseInt(EventsArray[d].StartTime.substr(0, 4));
            var eventMonth = parseInt(EventsArray[d].StartTime.substr(5, 2)) - 1;
            var eventDay = parseInt(EventsArray[d].StartTime.substr(8, 2));
            if (eventYear != year) continue;
            if (eventMonth != month) continue;
            if (eventDay != day) continue;
            count += 1;
            if (EventsArray[d].QuickLink) {
                html += '<tr class="' + (count % 2 == 1 ? 'odd' : 'even') + '" onclick=\'mainVM.eventsVM.indexClicked(' + d + ');\'>' + self.rowHtml(EventsArray[d]) + '</tr>\r\n';
            } else {
                html += '<tr class="' + (count % 2 == 1 ? 'odd' : 'even') + '">' + self.rowHtml(EventsArray[d]) + '</tr>\r\n';
            }
        }
        if (!html) html += '<tr class="odd"><td colspan="' + self.Columns().length + '">No ' + self.headerText() + ' Found ... </td></tr>';
        return html;
    }

    self.ColIcon = function (col) {
        if (!self.Sorting() && self.Columns()[0] == col) {
            return 'headerSortDown';
        } else if (self.Sorting().indexOf(col + ' ') == -1)
            return '';
        else if (self.Sorting().indexOf(' ASC') > -1)
            return 'headerSortDown';
        else
            return 'headerSortUp';
    };

    self.theadHTML = function () {
        var columns = self.Columns();

        var html = '';
        if (columns) {
            for (var d = 0; d < columns.length; d++) {
                var colText = columns[d];
                colText = colText.replace(/([a-z])([A-Z])/g, '$1 $2') //find each occurrence of a lower case character followed by an upper case character, and insert a space between them
                colText = colText.charAt(0).toUpperCase() + colText.slice(1); //Capitalise First Letter
                html += '<th data-priority="' + (d == 0 ? 'critical' : d) + '" class="header ' + self.ColIcon(columns[d]) + '" >' + colText + '</th>\r\n';
            }
        } else {
            html += '<td>No ' + self.headerText() + ' Found ... </td>';
        }
        return '<tr class="ui-bar-d" >' + html + '</tr>\r\n';

    }
    self.tfootHTML = function () {

        var html = '<tr><td colspan="' + self.Columns().length + '" style="text-align:right;">' + (self.TotalRecordCount() > 0 ? ' Page: ' : '&nbsp;');

        if (self.CurrentPage() > 1)
            html += ' <span onclick="mainVM.eventsVM.SetPage(' + (self.CurrentPage() - 1) + ');" style="cursor: pointer;"> &lt;&lt;</span> ';

        var pages = Array();
        var PageSize = parseInt(self.PageSize());
        var TotalRecordCount = parseInt(self.TotalRecordCount());
        for (var p = 0; p < TotalRecordCount; p += PageSize) {
            pages[pages.length] = pages.length + 1;
            html += ' <span onclick="mainVM.eventsVM.SetPage(' + pages.length + ');" style="cursor: pointer; font-weight:' + (self.CurrentPage() == pages.length ? 'bold;' : 'normal;') + '">' + pages.length + '</span> ';
        }

        if (self.CurrentPage() < pages.length)
            html += ' <span onclick="mainVM.dataVM.SetPage(' + (self.CurrentPage() + 1) + ');" style="cursor: pointer;"> &gt;&gt;</span> ';

        html += '</td></tr>';
        return html;

    }
}
