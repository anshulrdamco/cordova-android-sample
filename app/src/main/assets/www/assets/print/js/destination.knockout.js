function DestinationViewModel(data) {
    var self = this;
    self.data = data;
    self.rowHtml = function () {
        var data = self.data;
        var html = '';
        var ShowDisplayText = data["ShowDisplayText"] === 'true';

        for (var k in data) {
            if (k != 'quicklink' && k != 'ID' && k != 'ShowDisplayText' && (ShowDisplayText || k != 'DisplayText')) {
                if (self.QuickLink())
                    html += '<td><a href=\'#\' onlick=\'return false;\'>' + data[k] + '</a></td>';
                else
                    html += '<td>' + data[k] + '</td>';
            }
        }
        return html;
    }
    self.name = ko.observable();
    self.DisplayName = ko.observable();
    self.isGoogle = false;
    self.itemVisible = ko.observable(true);
    self.QuickLink = ko.observable();
    self.isSearchByTag = ko.observable(false);
    self.tagName = ko.observable('');
    self.isOffCampus = function () {
        return self.isGoogle || (self.QuickLink && self.QuickLink()? (self.QuickLink().length > 10?true :false ): true);
    }
}

function DestinationListViewModel() {
    var self = this;
    self.GetDestinationDataUrl = RESTSERVICESBASE + "api/destination/";
    self.lookup_reference = 'from';
    self.clientID = ko.observable().syncWith('ClientID');
    self.headerText = ko.observable();

    self.ClientDestinationID = ko.observable(0);
    self.Filter = ko.observable('');
    self.Sorting = ko.observable('');
    self.StartIndex = ko.observable(0);
    self.PageSize = ko.observable(100);
    self.Data = ko.observableArray();
    self.TotalRecordCount = ko.observable(0);

    self.selectedFrom_destination = ko.observable().publishOn("newLocationfrom");
    self.selectedTo_destination = ko.observable().publishOn("newLocationto");
    self.searchFrom_visible = ko.observable(true).publishOn('searchVisiblefrom');
    self.searchTo_visible = ko.observable(true).publishOn('searchVisibleto');
    self.PopulateData = function () {
        $('#destination-list-div').html('');

        $.support.cors = true;
        $.ajax({
            url: self.GetDestinationDataUrl + '?ClientDestinationTypeID=' + self.ClientDestinationID() + '&ClientID=' + self.clientID() + "&Filter=" + (self.Filter() || '') + "&Sorting=" + (self.Sorting() || '') + "&StartIndex=" + (self.StartIndex() || 0) + "&PageSize=" + (self.PageSize() || 10) + getJsonpSuffix(),
            type: "GET",
            dataType: getJsonDataType(),
            contentType: getJsonContentType(),
            success: function (data) {
                if (data.ClientDestinationID == self.ClientDestinationID() && data.ClientID == self.clientID()
                    && data.Filter == (self.Filter() || '') && data.Sorting == (self.Sorting() || '') && data.StartIndex == (self.StartIndex() || 0) && data.PageSize == (self.PageSize() || 10)
                    ) {
                    self.Data(data.Records);
                    self.TotalRecordCount(data.TotalRecordCount);
                    setTimeout(function () {
                        self.redrawTable();
                    }, 200);
                    setTimeout(function () {
                        $('#data').css('z-index:1');
                    }, 400);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                throw 'getJSON failed: ' + errorThrown + ' ' + self.GetDestinationDataUrl + '?ClientDestinationID=' + self.ClientDestinationID() + '&ClientID=' + self.clientID() + "&Filter=" + (self.Filter() || '') + "&Sorting=" + (self.Sorting() || '') + "&StartIndex=" + (self.StartIndex() || 0) + "&PageSize=" + (self.PageSize() || 10) + getJsonpSuffix();
            }
        });
    };

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
    self.CurrentPage = ko.computed(function () {
        return (self.StartIndex() / self.PageSize()) + 1;
    });
    self.Columns = ko.computed(function () {
        if (!(self.Data === undefined) && self.Data()) {
            var data = self.Data();
            var firstRow = data[data.length - 1];
            if (firstRow) {
                var name = Object.keys(firstRow);
                var ShowDisplayText = firstRow["ShowDisplayText"] === 'true';
                return name.filter(function (col) {
                    return col != 'ID' && col != 'quicklink' && col != 'ShowDisplayText' && (ShowDisplayText || col != 'DisplayText');
                });
            }
        }
    });
    self.ColumnCount = ko.computed(function () {
        if (self.Columns())
            return self.Columns().length;
    });


    self.ClientDestinationID.subscribe(function () {
        self.StartIndex(0);
        self.PopulateData();
    });
    self.Filter.subscribe(function () {
        self.StartIndex(0);
        self.PopulateData();
    });
    self.Sorting.subscribe(function () {
        self.PopulateData();
    });
    self.StartIndex.subscribe(function () {
        self.PopulateData();
    });
    self.PageSize.subscribe(function () {
        self.StartIndex(0);
        self.PopulateData();
    });

    self.redrawTable = function () {
        $('#destination-list-div').html(self.tableTag + '<thead>' + self.theadHTML() + '</thead><tbody>' + self.tbodyHTML() + '</tbody><tfoot>' + self.tfootHTML() + '</tfoot></table>');
    };

    self.tableTag = '<table data-role="table" id="destination-list-table" class="ui-body-d ui-shadow table-stripe ui-responsive tablesorter ui-table ui-table-reflow"  data-column-btn-theme="b" data-column-btn-text="Display" data-column-popup-theme="a" >'


    self.itemClicked = function (item) {
        if (self.lookup_reference == 'to') {
            self.selectedTo_destination(item);
            self.searchTo_visible(false);
        } else {
            self.selectedFrom_destination(item);
            self.searchFrom_visible(false);
        }
        PushNewState('page=home&' + self.lookup_reference + '=' + encodeURIComponent(item.name().replace('#', '%23')));
        mainVM.cleanData(); //clear out lookup data (prevent ghosts)

        mainVM.storageObject[self.lookup_reference + 'SearchType'] = 'lookup';
    }

    self.data_array2 = function () {
        var data_array2 = Array();
        var data = self.Data();

        if (data && data.length > 0) {
            var firstColumn = '';
            var ShowDisplayText = data[0]["ShowDisplayText"] === 'true';
            for (var k in data[0]) {
                if (k != 'quicklink' && k != 'ID' && k != 'ShowDisplayText' && (ShowDisplayText || k != 'DisplayText')) {
                    firstColumn = k;
                    break;
                }
            }

            for (var i = 0; i < data.length; i++) {

                var dvm2 = new DestinationViewModel(data[i]);
                dvm2.QuickLink(data[i].quicklink);
                dvm2.name(data[i].DisplayText);
                dvm2.DisplayName(data[i][firstColumn]); //(data[i].DisplayText);
                data_array2.push(dvm2);
            }
        }
        return data_array2;
    }

    self.indexClicked = function (index) {
        var item = self.data_array2()[index];
        self.itemClicked(item);
    }
    self.tbodyHTML = function () {

        var data_array2 = self.data_array2();
        var html = '';
        for (var d = 0; d < data_array2.length; d++) {
            if (data_array2[d].QuickLink()) {
                html += '<tr class="' + (d % 2 == 1 ? 'odd' : 'even') + '" onclick=\'mainVM.dataVM.indexClicked(' + d + ');\'>' + data_array2[d].rowHtml() + '</tr>\r\n';
            } else {
                html += '<tr class="' + (d % 2 == 1 ? 'odd' : 'even') + '">' + data_array2[d].rowHtml() + '</tr>\r\n';
            }
        }
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
            var ShowDisplayText = self.Data()[0]["ShowDisplayText"] === 'true';
            for (var d = 0; d < columns.length; d++) {
                var colText = columns[d];
                if (colText == 'DisplayText') {
                    colText = self.headerText();
                    if (!ShowDisplayText) {
                        continue;
                    }
                } else {
                    colText = colText.replace(/([a-z])([A-Z])/g, '$1 $2') //find each occurance of a lower case character followed by an upper case character, and insert a space between them
                    colText = colText.charAt(0).toUpperCase() + colText.slice(1); //Capitalise First Letter
                }
                html += '<th data-priority="' + (d == 0 ? 'critical' : d) + '" class="header ' + self.ColIcon(columns[d]) + '" onclick="mainVM.dataVM.SortBy(\'' + columns[d] + '\');">' + colText + '<span class=\'ui-icon ui-icon-back ui-icon-shadow ui-icon-lj-sort\'></span></th>\r\n';

            }
        } else {
            html += '<th>No results found ... </th>'
        }
        return '<tr class="ui-bar-d" >' + html + '</tr>\r\n';

    }
    self.tfootHTML = function () {

        var html = '<tr><td colspan="' + self.ColumnCount() + '" style="text-align:right;">' + (self.TotalRecordCount() > 0 ? ' Page: ' : '&nbsp;');

        if (self.CurrentPage() > 1)
            html += ' <span onclick="mainVM.dataVM.SetPage(' + (self.CurrentPage() - 1) + ');" style="cursor: pointer;"> &lt;&lt;</span> ';

        var pages = Array();
        var PageSize = parseInt(self.PageSize());
        var TotalRecordCount = parseInt(self.TotalRecordCount());
        for (var p = 0; p < TotalRecordCount; p += PageSize) {
            pages[pages.length] = pages.length + 1;
            html += ' <span onclick="mainVM.dataVM.SetPage(' + pages.length + ');" style="cursor: pointer; font-weight:' + (self.CurrentPage() == pages.length ? 'bold;' : 'normal;') + '">' + pages.length + '</span> ';
        }

        if (self.CurrentPage() < pages.length)
            html += ' <span onclick="mainVM.dataVM.SetPage(' + (self.CurrentPage() + 1) + ');" style="cursor: pointer;"> &gt;&gt;</span> ';

        html += '</td></tr>';
        return html;

    }
}
