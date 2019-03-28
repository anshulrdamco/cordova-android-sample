function DestinationListViewModel() {
    var self = this;
    self.lookup_reference = 'from';
    self.headerText = ko.observable();

    self.ClientDestinationID = ko.observable(0);
    self.Filter = ko.observable('');
    self.Sorting = ko.observable('');
    self.StartIndex = ko.observable(0);
    self.PageSize = ko.observable(1000000);
    self.Data = ko.observableArray();
    self.TotalRecordCount = ko.observable(0);

    self.selectedFrom_destination = ko.observable();
    self.selectedTo_destination = ko.observable();
    self.searchFrom_visible = ko.observable(true);
    self.searchTo_visible = ko.observable(true);

    self.PreviousVisible = ko.observable(false);
    self.NextVisible = ko.observable(true);

    self.ScrollUp = function () {
        var current = $('#destination-list-div').scrollTop();
        var height = $('#destination-list-div').innerHeight();
        $('#destination-list-div').scrollTop(current - height);
        self.PreviousVisible($('#destination-list-div').scrollTop() > 0);
        self.NextVisible($('#destination-list-div').scrollTop() < ($('#destination-list-div')[0].scrollHeight) - $('#destination-list-div').height());
    }

    self.ScrollDown = function () {
        var current = $('#destination-list-div').scrollTop();
        var height = $('#destination-list-div').innerHeight();
        $('#destination-list-div').scrollTop(current + height);
        self.PreviousVisible($('#destination-list-div').scrollTop() > 0);
        self.NextVisible($('#destination-list-div').scrollTop() < ($('#destination-list-div')[0].scrollHeight) - $('#destination-list-div').height());
    }

    self.PopulateData = function () {
        $('#destination-list-div').html('');

        $.support.cors = true;
        GetDestinationData(self.ClientDestinationID(), mainVM.ClientVM.clientID(), (self.Filter() || ''), (self.Sorting() || ''), (self.StartIndex() || 0), (self.PageSize() || 10), function (data) {
            if (data.ClientDestinationID == self.ClientDestinationID()
                && data.Filter == (self.Filter() || '') && data.Sorting == (self.Sorting() || '') && data.StartIndex == (self.StartIndex() || 0) && data.PageSize == (self.PageSize() || 10)
                ) {
                self.Data(data.Records);
                self.TotalRecordCount(data.TotalRecordCount);
                setTimeout(function () {
                    self.redrawTable();
                    $('#destination-list-div').scrollTop(0);
                    self.PreviousVisible($('#destination-list-div').scrollTop() > 0);
                    self.NextVisible($('#destination-list-div').scrollTop() < ($('#destination-list-div')[0].scrollHeight) - $('#destination-list-div').height());
                }, 200);
                setTimeout(function () {
                    $('#data').css('z-index:1');
                }, 400);
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
            var firstRow = data[0];
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
    });
    self.Filter.subscribe(function () {
        self.StartIndex(0);
    });
    self.Sorting.subscribe(function () {
        self.PopulateData();
    });
    self.StartIndex.subscribe(function () {
        self.PopulateData();
    });
    self.PageSize.subscribe(function () {
        self.StartIndex(0);
    });

    self.redrawTable = function () {
        $('#destination-list-div').html(self.tableTag + '<thead>' + self.theadHTML() + '</thead><tbody>' + self.tbodyHTML() + '</tbody><tfoot>' + self.tfootHTML() + '</tfoot></table>');
    };

    self.tableTag = '<table data-role="table" id="destination-list-table" class="DestinationListTable">';


    self.itemClicked = function (item) {
        mainVM.SendReporting('LIST', 'DESTINATIONCLICK', "", item.QuickLink());
        mainVM.SelectedDestination(item);
        mainVM.GetDirections(item.QuickLink());
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
                html += '<tr class="' + (d % 2 == 1 ? 'odd' : 'even') + '" onclick=\'mainVM.destinationListVM.indexClicked(' + d + ');\'>' + data_array2[d].rowHtml() + '</tr>\r\n';
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
                TranslateText(mainVM.CurrentLanguage(), colText, self.UpdateColumnText, d);
                html += '<th data-priority="' + (d == 0 ? 'critical' : d) + '" class="header ' + self.ColIcon(columns[d]) + '" onclick="mainVM.destinationListVM.SortBy(\'' + columns[d] + '\');"><span class="dataHeader' + d + '"></span><span class=\'ui-icon ui-icon-back ui-icon-shadow ui-icon-lj-sort\'></span></th>\r\n';

            }
        } else {
            html += '<th>No results found ... </th>'
        }
        return '<tr class="ui-bar-d" >' + html + '</tr>\r\n';

    }

    self.UpdateColumnText = function (text, colIndex) {
        setTimeout(function () {
            $('.dataHeader' + colIndex).text(text);
        },500);
    }

    self.tfootHTML = function () {
        return "";
        //var html = '<tr><td colspan="' + self.ColumnCount() + '" style="text-align:right;">' + (self.TotalRecordCount() > 0 ? ' Page: ' : '&nbsp;');

        //if (self.CurrentPage() > 1)
        //    html += ' <span onclick="mainVM.dataVM.SetPage(' + (self.CurrentPage() - 1) + ');" style="cursor: pointer;"> &lt;&lt;</span> ';

        //var pages = Array();
        //var PageSize = parseInt(self.PageSize());
        //var TotalRecordCount = parseInt(self.TotalRecordCount());
        //for (var p = 0; p < TotalRecordCount; p += PageSize) {
        //    pages[pages.length] = pages.length + 1;
        //    html += ' <span onclick="mainVM.dataVM.SetPage(' + pages.length + ');" style="cursor: pointer; font-weight:' + (self.CurrentPage() == pages.length ? 'bold;' : 'normal;') + '">' + pages.length + '</span> ';
        //}

        //if (self.CurrentPage() < pages.length)
        //    html += ' <span onclick="mainVM.dataVM.SetPage(' + (self.CurrentPage() + 1) + ');" style="cursor: pointer;"> &gt;&gt;</span> ';

        //html += '</td></tr>';
        //return html;

    }
}
