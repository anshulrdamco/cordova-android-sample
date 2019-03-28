// Start : GeoFence Models

var MapOverlayGeoFence = function () {
    var self = this;
    var innerPadding = 5;

    self.Id = ko.observable();
    self.Position = ko.observable(new Point(0, 0));
    self.Radius = ko.observable(25);
    self.FloorName = ko.observable();
    self.FloorPlanId = ko.observable();
    self.Message = ko.observable();
    self.StartTime = ko.observable();
    self.EndTime = ko.observable();
    self.IsActive = ko.observable(true);
    self.IsDirty = ko.observable(true);

    self.LoadFromObject = function (geoFence) {
        self.Id(geoFence.ID);
        self.FloorName(geoFence.FloorName);
        self.FloorPlanId(geoFence.FloorPlanId);
        self.Message(geoFence.Message);
        self.StartTime(getMinutesInTime(geoFence.StartTime));
        self.EndTime(getMinutesInTime(geoFence.EndTime));
        self.IsActive(geoFence.IsActive);
        self.IsDirty(false);
        self.Position(new Point(geoFence.X, geoFence.Y));
        self.Radius(geoFence.Radius);
    };

    function getMinutesInTime(totalMinutes) {
        if (!totalMinutes || isNaN(totalMinutes) || totalMinutes < 0) {
            return null;
        }

        var minutes = totalMinutes % 60;
        var period = "";
        var hours = parseInt(totalMinutes / 60);

        if (totalMinutes / 60 > 12) {
            period = " pm";

            if (hours > 12) {
                hours = hours - 12;
            }
        }
        else {
            period = " am";
            if (hours == 0) {
                hours = 12;
            }
        }

        return padZeros(hours, 2) + ":" + padZeros(minutes, 2) + period;
    }
}

// End : GeoFence Models