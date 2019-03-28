function LookupViewModel(type) {
    var self = this;
    self.lookupItemType = type;
    self.data_id = 1;
    self.ID = 0;
    self.mainHeaderTextEnglish = ko.observable();
    self.mainHeaderText = ko.observable();
    self.CurrentLanguage = ko.observable('english');
    self.mainHeaderTextEnglish.subscribe(function (newVal) {
        self.mainHeaderText(newVal);
    });
    self.headerTextEnglish = ko.observable("Select an Option.");
    self.headerText = ko.observable("Select an Option.");
    self.headerTextEnglish.subscribe(function (newVal) {
        self.headerText(newVal);
    });
    self.subItems = ko.observableArray([]);
    self.CurrentLanguage.subscribe(function (newVal) {
        for (var i = 0; i < self.subItems().length; i++) {
            self.subItems()[i].CurrentLanguage(newVal);
        }
        TranslateText(newVal, self.mainHeaderTextEnglish(), self.mainHeaderText);
        TranslateText(newVal, self.headerTextEnglish(), self.headerText);
    });
    //Object.defineProperty(self, 'selectedSubItem', {value:ko.observable().syncWith('selectedItem')});
    self.hasSubItems = ko.computed(function () {
        return self.subItems().length > 0;
    });
}