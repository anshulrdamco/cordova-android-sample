var ContentGeofenceViewModel = (function () {

    var ContentGeofenceViewModel = function () {
        var self = this;

        // Start : Content
        self.Contents = ko.observableArray([]);
        self.LoadMapOverlayContents = function (mapOverlayContents) {
            self.Contents([]);
            $(mapOverlayContents).each(function (index, con) {
                var content = new MapOverlayContent();
                content.LoadFromObject(con);

                if (con.Icon.Url) {
                    $.get(con.Icon.Url, function (data) {
                        content.Icon().Svg(data);
                    });
                }

                self.Contents.push(content);
            });


            self.IsEverythingLoaded(1);

            //switch(self.IsEverythingLoaded())
            //{
            //    case null: self.IsEverythingLoaded(false);
            //        break;
            //    case false: self.IsEverythingLoaded(1);
            //        break;
            //    case 1: self.IsEverythingLoaded(1);
            //        break;
            //}
        }

        self.GetContents = function (floorId) {
            ajax_CallMethod(RESTSERVICESBASE + 'api/MapOverlayContent?floorPlanId=' + floorId, "GET", null,
            function (result) {
                switch (result.Status) {
                    case "Success":
                        {
                            self.LoadMapOverlayContents(result.Data);
                            console.log("Content is successfully loaded");
                            break;
                        }
                    case "Error":
                        {
                            alert("Could not load geo fences.");
                            console.log("Error ocurred:" + result.Message);
                            break;
                        }
                }

            },
            function (response) {
                //UnreachableError("Some error occured!!! Please try again later.");
                console.log("Some error occured!!! Please try again later.");
            });
        }
        // End : Content

        // Start GeoFences
        self.GeoFences = ko.observableArray([]);
        self.LoadMapFloorGeoFences = function (mapOverlayGeoFences) {
            self.GeoFences([]);
            $(mapOverlayGeoFences).each(function (index, gf) {
                var geoFence = new MapOverlayGeoFence();
                geoFence.LoadFromObject(gf);

                self.GeoFences.push(geoFence);
            });


            switch (self.IsEverythingLoaded()) {
                case null: self.IsEverythingLoaded(false);
                    break;
                case false: self.IsEverythingLoaded(1);
                    break;
                case 1: self.IsEverythingLoaded(1);
                    break;
            }
        }

        self.GetGeoFences = function (floorId) {
            ajax_CallMethod(RESTSERVICESBASE + 'api/mapfloorgeofence?floorPlanId=' + floorId, "GET", null,
            function (result) {
                switch (result.Status) {
                    case "Success":
                        {
                            self.LoadMapFloorGeoFences(result.Data);
                            console.log("GeoFence is successfully loaded");
                            break;
                        }
                    case "Error":
                        {
                            alert("Could not load geo fences.");
                            console.log("Error ocurred:" + result.Message);
                            break;
                        }
                }

            },
            function (response) {
                //UnreachableError("Some error occured!!! Please try again later.");
                console.log("Some error occured!!! Please try again later.");
            });
        }
        // End GeoFences

        self.Init = function (floorId) {
            //floorId = 13996;
            self.GetContents(floorId);
            //self.GetGeoFences(floorId);
        }

        self.IsEverythingLoaded = ko.observable(null);
        self.CurrentScale = ko.observable(1);
        self.MapRotation = ko.observable(0);
    }
    return ContentGeofenceViewModel;
})();