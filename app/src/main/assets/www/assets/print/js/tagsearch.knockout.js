function TagSearchViewModel() {
    var self = this;
    self.AllDestinationData = ko.observableArray();

    self.getAllDestinationData = function (clientId) {
        if (clientId)
        {
            $.support.cors = true;
            $.ajax({
                url: RESTSERVICESBASE + 'api/destination/getdestinationdata?clientid=' + clientId,
                type: "GET",
                dataType: "json",
                //contentType: getJsonContentType(),
                success: function(data) {
                    var responseData = data.Response;
                    var allDestinationTypesData = [];

                    for (var index = 0; index < responseData.length; index++) {
                        var destinationList = responseData[index].Destinations;

                        var directionsData = [];
                        var directoryListFilteredByLanguageData = new DirectoryListModel();
                        directoryListFilteredByLanguageData.MenuLabel=data.Response[index].MenuLabel;
                        // directoryListFilteredByLanguageData.VisibleColumnNames=data.Response[index].VisibleColumnNames.split(',');
                        directoryListFilteredByLanguageData.VisibleColumnNames=[];
                        directoryListFilteredByLanguageData.VisibleColumnNames.push('Tags');
                        var columnList = directoryListFilteredByLanguageData.VisibleColumnNames.concat(data.Response[index].VisibleColumnNames.split(','));
                        directoryListFilteredByLanguageData.VisibleColumnNames=columnList;
                        if (destinationList.length > 0 && destinationList[0].Language) {
                            for (var innerIndex = 0; innerIndex < destinationList.length; innerIndex++) {
                                var currentLanguageKey = destinationList[innerIndex].Language.toLowerCase();
                                if (!directionsData[currentLanguageKey]) {
                                    directionsData[currentLanguageKey] = [];
                                }
                                directionsData[currentLanguageKey].push(destinationList[innerIndex]);
                            }
                        }
                        else {
                            for (var innerIndex = 0; innerIndex < destinationList.length; innerIndex++) {
                                var currentLanguageKey = 'english';
                                if (!directionsData[currentLanguageKey]) {
                                    directionsData[currentLanguageKey] = [];
                                }
                                directionsData[currentLanguageKey].push(destinationList[innerIndex]);
                            }
                        }
                        directoryListFilteredByLanguageData.Destinations = directionsData;
                        //directionsData[this.appState.language.getValue().toLowerCase()];
                        allDestinationTypesData.push(directoryListFilteredByLanguageData);
                    }
                    self.AllDestinationData(allDestinationTypesData);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    throw 'getJSON failed: ' + errorThrown;
                }
            });
        }        
    }

}


function DirectoryListModel() {

    var self = this;

    self.MenuLabel = '';

    self.VisibleColumnNames='';

    self.Destinations = [];
}

function DirectorySearchedTextModel()
{
    var self = this;

    self.SearchedData = '';

    self.TagName = '';

    self.Quicklink = '';

    self.IsSearchByTag = false;

    self.CategoryName = '';

    self.DisplayText = '';
}