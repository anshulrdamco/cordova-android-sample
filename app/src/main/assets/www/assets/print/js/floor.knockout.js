function FloorViewModel() {
    var self = this;
    self.EnglishName = ko.observable();
    self.CurrentLanguage = ko.observable('english');
    self.Name = ko.observable();
    self.EnglishName.subscribe(function (newVal) {
        self.Name(newVal);
    });
    self.CurrentLanguage.subscribe(function (newVal) {
        TranslateText(newVal, self.EnglishName(), self.Name);
    });
    self.ID = 0;
}