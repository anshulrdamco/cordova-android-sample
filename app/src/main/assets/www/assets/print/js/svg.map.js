// TODO: Find the uses of this model

var Point = function (x, y) {
    var self = this;
    self.X = ko.observable(x);
    self.Y = ko.observable(y);
}

var LocationMarkerType = {
    YouAreHere: 0,
    AlertZone: 1
};

var LocationMarker = function (locationMarkerType) {
    var self = this;
    self.Id = ko.observable();
    self.QuickLink = ko.observable();
    self.X = ko.observable(-100000);
    self.Y = ko.observable(-100000);
    self.BaseCircleCssClass = ko.observable();
    self.MessageBoxCssClass = ko.observable();
    self.MessageBoxArrowFillColor = ko.observable();
    self.MessageText = ko.observable();
    self.MessageTextFillColor = ko.observable();
    self.IsVisible = ko.observable(false);
    self.Type = ko.observable(locationMarkerType);
    self.CurrentFloor = ko.observable();
    self.StartingFloor = ko.observable(0);
    self.OldFloorId = ko.observable(0);
    self.IsQuickLinkDataLoaded = ko.observable(false);
    self.FloorChangeCallback = function () { };
    self.CurrentFloor.subscribe(function (floorId) {
        self.FloorChangeCallback(floorId);
    });
    self.CircleRadius = ko.observable(15);
    self.TextFontSize = ko.observable(20);
}

var MapConstants = {
    MainSvgIdSuffix: '-mainSvg',
    GeoFencesIdSuffix: '-GeoFences',
    ContentsIdSuffix: '-Contents',
    YouAreHereIdSuffix: '-YouAreHere',
    PathGroupIdSuffix: '-pathGroup',
    SlideMoverIdSuffix: '-slideMover',
    GroupOfCompassIdSuffix: '-gCompass',
    CompassIdSuffix: '-Compass',
    CompassArrowSvg: 'm13.847,0l-13.847,26.654l13.848,-5.063l14.152,5.156l-14.153,-26.747zm0,3.366l10.933,20.755l-10.933,-4.391v-16.364l0,0z',
    CompassNSvg: 'm4.943,50v-21.223h4.146l8.642,14.174v-14.174h3.959v21.223h-4.276l-8.511,-13.84v13.84h-3.96l0,0z',
    MessageBoxSvg: 'M247,56.5H51.3c-5.5,0-9.8,4.7-9.8,10.2v18.8L27,96.4l14.5,10.1v16.2c0,5.5,4.3,9.8,9.8,9.8H247c5.5,0,9.5-4.3,9.5-9.8v-56C256.5,61.2,252.5,56.5,247,56.5z',
    MessageBoxArrow: '100,85 76,85 76,76 58.3,94.5 76,113 76,105 100,105',
    DefaultBBoxPadding: 20,
    DefaultSvgHeight: 2500,
    DefaultSvgWidth: 5000,
    MinScale: 0.125,
    MaxScale: 2,
    MaxWalkingScale: 1,
    AlertZoneIdSuffix: '-alertZone',
};

// Always pass the clientId and mapContainerSelector
var SvgMap = function (clientId, mapContainerSelector) {
    var self = this;

    // Start : Map Setup Properties
    self.MapContainerSelector = ko.observable(mapContainerSelector);

    self.GetSelector = function (elementId, returnName) {
        elementId = elementId || '';
        return (returnName ? "" : '#') + self.MapContainerSelector() + elementId;
    };

    self.ClientId = ko.observable(clientId)

    self.Id = ko.observable(self.GetSelector(MapConstants.MainSvgIdSuffix, true));

    // End : Map Setup Properties


    // Start : Booblean States
    self.HoldUpdating = ko.observable(false);
    self.IsMapLoaded = ko.observable(false);

    self.IsPortalParametersLoaded = ko.observable(false);
    self.IsQuickLinkDataLoaded = ko.observable(false);

    self.IsBaseState = ko.observable(true);
    self.MapHasPath = ko.observable(false);
    // End : Booblean States

    // Start : Map Properties
    self.CurrentFloor = ko.observable();
    self.ClosestRestroomQL = ko.observable('');;
    self.OldFloorId = ko.observable(0);
    self.StartingFloor = ko.observable(0);
    self.FloorFileName = ko.observable("");
    self.Svg = ko.observable();
    self.ActiveLocation = ko.observable(new Point(-1, -1));
    self.Html = ko.observable();
    // End : Map Properties

    // Start : Shortest Path Properties
    self.ShortestPath = null;
    self.BBox = ko.observable();
    self.BBoxPadding = ko.observable(MapConstants.DefaultBBoxPadding);
    self.Reset = ko.observable();
    self.ResetScale = ko.observable();
    self.MapIndex = ko.observable(1);
    self.MapSteps = ko.observableArray([]);
    self.Width = ko.observable();
    self.Height = ko.observable();
    self.AspectRatio = ko.observable();
    // End : Shortest Path Properties


    // Start :  Zoom, Rotate & Scale Properties
    var MapGroup = function () { return d3.select(self.GetSelector(MapConstants.MainSvgIdSuffix) + " g"); };
    self.SvgHeight = ko.observable(MapConstants.DefaultSvgHeight);
    self.SvgWidth = ko.observable(MapConstants.DefaultSvgWidth);
    self.BoxSize = ko.observable();
    self.MinScale = ko.observable(MapConstants.MinScale);
    self.MaxScale = ko.observable(MapConstants.MaxScale);
    self.MaxWalkingScale = ko.observable(MapConstants.MaxWalkingScale);
    self.RotateX = ko.observable(0);
    self.RotateY = ko.observable(0);
    self.DefaultSize = ko.observable(20);
    self.CurrentScale = ko.observable();
    self.XScale = ko.observable();
    self.MapRotation = ko.observable(0);
    self.ZoomType = ko.observable();
    self.ZoomScale = ko.observable();
    self.Translate = ko.observableArray();
    self.Zoom = d3.behavior.zoom().scaleExtent([self.MinScale(), self.MaxScale()]).on("zoom", customZoom);
    // End :  Zoom & Scale Properties


    // Start : Location markers properties
    self.IsAlertZoneQuickLinkDataLoaded = ko.observable(false);

    self.AlertZoneId = ko.observable();
    self.AlertFloor = ko.observable();

    self.AlertZoneLocation = ko.observable(new LocationMarker());

    self.LocationMarkers = ko.observableArray([]);
    self.GetLocationMarkerByType = function (type) {
        var locMarker = ko.utils.arrayFirst(self.LocationMarkers(), function (mrkr) {
            return mrkr.Type == type;
        });
        return locMarker;
    }
    // End : Location markers Properties

    // Start : Map Operations

    self.Init = function (kioskQuickLink, alertZoneQuickLink, showYouAreHere) {

        self.Width($(self.GetSelector()).width());
        self.Height($(self.GetSelector()).height());
        self.AspectRatio(self.Width() / self.Height());

        // Create the location marker based on kioskQuickLink
        var locMarker = createLocationMarker(LocationMarkerType.YouAreHere);
        locMarker.QuickLink(kioskQuickLink || getParameterByName(window.location.href, "location"));
        self.LocationMarkers.push(locMarker);

        // If alertZoneQuickLink is passed create the location marker for it
        if (alertZoneQuickLink) {
            locMarker = createLocationMarker(LocationMarkerType.AlertZone);
            locMarker.QuickLink(alertZoneQuickLink);
            self.LocationMarkers.push(locMarker);
        }

        self.LoadPortalParameters();

        ko.utils.arrayForEach(self.LocationMarkers(), function (marker) {
            self.GetQuicklinkData(marker);
            self.DrawLocationMarker(marker);
        });
    };

    self.LoadPortalParameters = function () {
        var host = getParameterByName(window.location.href, "host");
        GetPortalParameters(host, function (data) {
            if (data.ClientViewModel.clientID) self.ClientId(data.ClientViewModel.clientID);
            if (data.ClientViewModel.MapHeight) self.SvgHeight(parseInt(data.ClientViewModel.MapHeight));
            if (data.ClientViewModel.MapWidth) self.SvgWidth(parseInt(data.ClientViewModel.MapWidth));
            self.IsPortalParametersLoaded(true);
        });
    };

    self.GetQuicklinkDataOLD = function (loc) {
        if (self.IsPortalParametersLoaded()) {
            loc = loc || getParameterByName(window.location.href, "location");
            GetQuicklinkData(self.ClientId(), loc, function (data) {

                if (data.result) {
                    if (self.StartingFloor() == 0) {
                        self.StartingFloor(data.FloorID);
                    }

                    //self.HoldUpdating = true;
                    self.CurrentFloor(data.FloorID);
                    //self.HoldUpdating = false;
                    self.YouAreHere().X = data.X;
                    self.YouAreHere().Y = data.Y;
                    //self.LoadBackgroundMap(data.FloorID);
                    self.ClosestRestroomQL(data.ClosestRR);
                    if (data.KioskEmail != null) self.KioskInfo().Email((data.KioskEmail == "true") || (data.KioskEmail == "True"));
                    if (data.KioskPrint != null) self.KioskInfo().Print((data.KioskPrint == "true") || (data.KioskPrint == "True"));
                    if (data.KioskLiveConnect != null) self.KioskInfo().LiveConnect((data.KioskLiveConnect == "true") || (data.KioskLiveConnect == "True"));
                    self.KioskInfo().LiveConnectURL(data.KioskLiveConnectURL);
                    if (data.KioskAvatarGreeting != null) self.KioskInfo().AvatarGreeting((data.KioskAvatarGreeting == "true") || (data.KioskAvatarGreeting == "True"));
                    if (data.KioskAvatarMenus != null) self.KioskInfo().AvatarMenus((data.KioskAvatarMenus == "true") || (data.KioskAvatarMenus == "True"));
                    self.KioskInfo().QRAddressBase(data.QRAddressBase);
                    self.CurrentLocation(data.UniqueDestination);
                    self.KioskInfo().RRName = data.RRName;
                    self.KioskInfo().EDName = data.EDName;
                    self.IsQuickLinkDataLoaded(true);
                    //Only display the video if the avatar greeting is available
                    if (data.QRAddressBase) {
                        var host = data.QRAddressBase.split("/")[2].split(".")[0];
                        self.CurrentHost = host;
                        //OnPageLoad Video Update
                        //if (self.KioskInfo().AvatarGreeting()) {
                        //    //var host = getParameterByName(window.location.href, "host");
                        //    var videoFile = 'https://ljwbk.blob.core.windows.net/media/' + host + '_greeting.mp4';
                        //    $('#avatarGreetingVideo source').attr('src', videoFile);
                        //    $('#avatarGreetingVideo')[0].load();
                        //    $('#avatarGreetingVideo')[0].play();
                        //}
                    }
                }
            });
        } else {
            setTimeout(function () { self.GetQuicklinkData(loc); }, 100);
        }
    };

    self.GetQuicklinkData = function (locmarker) {
        if (self.IsPortalParametersLoaded()) {
            GetQuicklinkData(self.ClientId(), locmarker.QuickLink(), function (data) {

                if (data.result) {
                    if (locmarker.StartingFloor() == 0) {
                        locmarker.StartingFloor(data.FloorID);
                    }
                    locmarker.CurrentFloor(data.FloorID);
                    locmarker.X(data.X);
                    locmarker.Y(data.Y);
                    locmarker.IsQuickLinkDataLoaded(true);

                    if ((self.ActiveLocation().X() == -1 && self.ActiveLocation().Y() == -1) || locmarker.Type == LocationMarkerType.AlertZone) {
                        self.ActiveLocation(new Point(locmarker.X(), locmarker.Y()));
                    }

                    // Load Contents
                    self.GetContents(data.FloorID);
                    //self.GetGeoFences(data.FloorID);
                }
            });
        } else {
            setTimeout(function () { self.GetQuicklinkData(locmarker); }, 500);
        }
    };

    // Start :  Refresh/Reload map on CurrentFloor change

    self.FloorChangeCallback = function (floorId) {
        if (floorId != 0 && floorId != self.OldFloorId()) {
            self.IsMapLoaded(false);
            self.ReloadMap(floorId);
            self.OldFloorId(floorId);
        }
    };

    self.ReloadMap = function (mapFloorId) {
        if (self.IsPortalParametersLoaded() && mapFloorId) {
            GetMapURL(mapFloorId, function (data) {
                self.FloorFileName(data);
                self.GetMapSvgFromServer();
            });
        } else {
            setTimeout(function () { self.ReloadMap(mapFloorId); }, 100);
        }
    };

    self.GetMapSvgFromServer = function () {
        if (self.IsPortalParametersLoaded() && self.FloorFileName()) {
            // self.SetMapSvg is a function for callback
            GetMapXML(self.FloorFileName() + '.svg', self.SetMapSvg);
        } else {
            setTimeout(self.GetMapSvgFromServer, 100);
        }
    }

    self.SetMapSvg = function (data) {
        if (data) {
            self.Svg(data);
            self.IsMapLoaded(true);
            self.DrawDirectionIndicator();
            d3.select(self.GetSelector(MapConstants.MainSvgIdSuffix)).call(self.Zoom);
        }
    };

    // End :  Refresh/Reload map on CurrentFloor change

    self.DrawDirectionIndicator = function () {
        self.BoxSize(0);
        self.XScale(0);
        self.ZoomType(0);

        //have to remove before adding in order to prevent duplicate controls from being drawn
        d3.select(self.GetSelector(MapConstants.GroupOfCompassIdSuffix)).remove();
        var g4 = d3
				.select(self.GetSelector(MapConstants.MainSvgIdSuffix))
				.append('g')
				.attr("transform", " translate(10,70)")
				.attr("id", self.GetSelector(MapConstants.GroupOfCompassIdSuffix, true));

        var compass = g4
					.append("g")
					.attr("id", self.GetSelector(MapConstants.CompassIdSuffix, true));

        compass.append('svg:path')
			.attr("d", MapConstants.CompassArrowSvg)
			.attr("fill", "#4890CD");

        compass.append('svg:path')
			.attr("d", MapConstants.CompassNSvg)
			.attr("fill", "#4890CD");

        setSlider(self.Zoom.scale());
    }

    self.CenterMap = function () {
        var x = self.ActiveLocation().X();
        var y = self.ActiveLocation().Y();

        if (self.IsMapLoaded() && !self.MapHasPath()) {
            var bBox = self.GetBoundingBoxPoint(x, y, null, self.GetSelector(MapConstants.MainSvgIdSuffix), self.SvgHeight(), self.SvgWidth(), self.ZoomScale());
            self.BBox(bBox);

            self.Reset([-(bBox[0]), -(bBox[1])]);
            self.CurrentScale(bBox[6]);
            self.ZoomScale(bBox[6]);
            self.ResetScale(self.ZoomScale());
            self.Zoom.translate([-(bBox[0]), -(bBox[1])]).scale(self.ZoomScale());
            //self.Svg().attr("transform", "translate(" + -bBox[0] + ", " + -bBox[1] + ")scale(" + self.ZoomScale() + ")");
            MapGroup().attr("transform", "translate(" + -bBox[0] + ", " + -bBox[1] + ")scale(" + self.ZoomScale() + ")");
        } else if (!self.IsMapLoaded()) {
            setTimeout(self.CenterMap, 100);
            return;
        }


        ko.utils.arrayForEach(self.LocationMarkers(), function (marker) {
            marker.TextFontSize((self.DefaultSize() / self.CurrentScale()));
            marker.CircleRadius((self.DefaultSize() / self.CurrentScale()));
        });
        //$(self.GetSelector(MapConstants.YouAreHereIdSuffix) + ' circle').attr("r", 15 / self.CurrentScale());
        //$(self.GetSelector(MapConstants.YouAreHereIdSuffix) + ' text').attr("font-size", 20 / self.CurrentScale());

    }

    self.GetBoundingBox = function (pathpoints, w, h, boxSize, initialZoom) {
        var vBoxValues = pathpoints.split(' ').join(' ').split(',').join(' ').split(' ');
        var vValues = pathpoints.split(' ');
        var xValues, zoomLevel;
        var yValues;
        for (i = 0; i < vValues.length; i++) {
            var splitval = vValues[i].split(',')
            if (i == 0) {
                xValues = splitval[0];
                yValues = splitval[1];
            }
            else {
                xValues = xValues + " " + splitval[0];
                yValues = yValues + " " + splitval[1];
            }
        }
        var xBoxValues = xValues.split(' ');
        var yBoxValues = yValues.split(' ');
        for (var i = 0; i < xBoxValues.length; i++) {
            xBoxValues[i] = parseInt(xBoxValues[i]);
        }
        for (var i = 0; i < yBoxValues.length; i++) {
            yBoxValues[i] = parseInt(yBoxValues[i]);
        }

        var xMax = Math.max.apply(Math, xBoxValues);
        var xMin = Math.min.apply(Math, xBoxValues);
        var yMax = Math.max.apply(Math, yBoxValues);
        var yMin = Math.min.apply(Math, yBoxValues);
        var xMid = (xMax + xMin) / 2
        var yMid = (yMax + yMin) / 2

        var svgBox = $(self.GetSelector());
        var width = (w ? w : (svgBox.width() ? svgBox.width() : 900));
        var height = (h ? h : (svgBox.height() ? svgBox.height() : 700));

        width = width * (100 - self.BBoxPadding()) / 100
        height = height * (100 - self.BBoxPadding()) / 100

        if (!!boxSize) {
            width = width + (width * (boxSize) / 100 / 2)
            height = height + (height * (boxSize) / 100 / 2)
        }

        self.Width(width);
        self.Height(height);

        self.AspectRatio(width / height); //Aspect Ratio of the SVG BOX

        var xDist = (xMax - xMin);
        var yDist = (yMax - yMin);

        //MAP_WIDTH = xDist;
        //MAP_HEIGHT = yDist;

        self.ZoomScale(self.Zoom.scale());

        if (initialZoom) {
            self.ZoomScale(Math.min(width / xDist, height / yDist));
        }
        if (self.ZoomScale() > self.MaxScale()) {
            self.ZoomScale(self.MaxScale());
        }
        if (self.ZoomScale() < self.MinScale()) {
            self.ZoomScale(self.MinScale());
        }

        if (w < 320 && h < 320 //walking is 250x250
			&& self.ZoomScale() > self.MaxWalkingScale()) {
            self.ZoomScale(self.MaxWalkingScale());
        }

        zoomLevel = self.ZoomScale();

        var xp = width * (self.BBoxPadding()) / 2 / 100; //+ BBOX_PADDING
        var yp = height * (self.BBoxPadding()) / 2 / 100; //+ BBOX_PADDING

        var xScaled = xp + (width / 2);
        var yScaled = yp + (height / 2);

        var x3 = xScaled - ((xDist * zoomLevel) / 2);
        var y3 = yScaled - ((yDist * zoomLevel) / 2);


        var xLeft = (xMin * zoomLevel - x3);
        var yTop = (yMin * zoomLevel - y3);
        //RemoveControls();
        //DrawDirectionIndicator();
        var lineWidth = Math.ceil(3 / (zoomLevel ? zoomLevel : 1));
        var bigRadius = Math.ceil(lineWidth * 2);
        var smallRadius = Math.ceil(bigRadius * 0.9);
        if (lineWidth < 3) lineWidth = 3;
        if (bigRadius < 10) bigRadius = 10;
        if (smallRadius < 9) smallRadius = 9;

        self.RotateX(xMid);
        self.RotateY(yMid);

        return [(xLeft), (yTop), xMin, yMin, xDist, yDist, zoomLevel, xMid, yMid, lineWidth, bigRadius, smallRadius];
    }

    self.GetBoundingBoxPoint = function (centerX, centerY, initialZoom, elementID, height, width, scale) {

        var xMax = parseInt(centerX) + (width * .05);
        var xMin = parseInt(centerX) - (width * .05);
        var yMax = parseInt(centerY) + (height * .05);
        var yMin = parseInt(centerY) - (height * .05);
        var xMid = centerX;
        var yMid = centerY;


        self.Width($(elementID).width());
        self.Height($(elementID).height());
        self.Width(self.Width() * (100 - self.BBoxPadding()) / 100);
        self.Height(self.Height() * (100 - self.BBoxPadding()) / 100);

        self.AspectRatio(self.Width() / self.Height()); //Aspect Ratio of the SVG BOX

        var xDist = (xMax - xMin);
        var yDist = (yMax - yMin);
        //MAP_WIDTH = xDist;
        //MAP_HEIGHT = yDist;

        self.ZoomScale(self.Zoom.scale());

        if (initialZoom) {
            var shortestPathAspectRatio = xDist / yDist; //ASPECT RATIO of the Shortest Path Bounding Box

            if (shortestPathAspectRatio >= self.AspectRatio()) //if the aspect ratio of the SP Bounding Box is greater than the SVG BOX aspect ratio we should consider width for the aspect ratio
            {
                self.ZoomScale(self.Width() / xDist);
            }
            else //if the aspect ratio of the SP Bounding Box is less than the SVG BOX aspect ratio we should consider height for the aspect ratio
            {
                self.ZoomScale(self.Height() / yDist);
            }
        }
        if (self.ZoomScale() > self.MaxScale()) {
            self.ZoomScale(self.MaxScale());
        }
        if (self.ZoomScale() < self.MinScale()) {
            self.ZoomScale(self.MinScale());
        }

        var zoomLevel = self.ZoomScale();


        var xp = self.Width() * (self.BBoxPadding()) / 2 / 100; //+ BBOX_PADDING
        var yp = self.Height() * (self.BBoxPadding()) / 2 / 100; //+ BBOX_PADDING

        var xScaled = xp + (self.Width() / 2);
        var yScaled = yp + (self.Height() / 2);

        var x3 = xScaled - ((xDist * zoomLevel) / 2);
        var y3 = yScaled - ((yDist * zoomLevel) / 2);


        var xLeft = (xMin * zoomLevel - x3);
        var yTop = (yMin * zoomLevel - y3);
        //RemoveControls();
        //DrawDirectionIndicator();
        self.RotateX(xMid);
        self.RotateY(yMid);
        return [(xLeft), (yTop), xMin, yMin, xDist, yDist, zoomLevel, xMid, yMid];
    }

    // End : Map Operations

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
    //self.GeoFences = ko.observableArray([]);
    //self.LoadMapFloorGeoFences = function (mapOverlayGeoFences) {
    //    self.GeoFences([]);
    //    $(mapOverlayGeoFences).each(function (index, gf) {
    //        var geoFence = new MapOverlayGeoFence();
    //        geoFence.LoadFromObject(gf);

    //        self.GeoFences.push(geoFence);
    //    });
    //}

    //self.GetGeoFences = function (floorId) {
    //    ajax_CallMethod(RESTSERVICESBASE + 'api/mapfloorgeofence?floorPlanId=' + floorId, "GET", null,
	//	function (result) {
	//	    switch (result.Status) {
	//	        case "Success":
	//	            {
	//	                self.LoadMapFloorGeoFences(result.Data);
	//	                console.log("GeoFence is successfully loaded");
	//	                break;
	//	            }
	//	        case "Error":
	//	            {
	//	                alert("Could not load geo fences.");
	//	                console.log("Error ocurred:" + result.Message);
	//	                break;
	//	            }
	//	    }

	//	},
	//	function (response) {
	//	    //UnreachableError("Some error occured!!! Please try again later.");
	//	    console.log("Some error occured!!! Please try again later.");
	//	});
    //}
    // End GeoFences

    // Start : Control Toolbox Features

    self.ZoomInMap = function () {
        var scale = self.Zoom.scale();
        self.BoxSize(1); // added hack for preventing deep zoom
        if ((scale + 0.1 >= self.MinScale()) && (scale + 0.1 <= self.MaxScale())) {
            var BBox = self.GetBoundingBoxForZoomPoint(self.ActiveLocation().X(), self.ActiveLocation().Y(), $(self.GetSelector()).width(), $(self.GetSelector()).height(), 1);
            self.Zoom.translate([-(BBox[0]), -(BBox[1])]).scale(BBox[6]);
            customZoom();
        }
    };

    self.ZoomOutMap = function () {
        var scale = self.Zoom.scale();
        self.BoxSize(0); // added hack for preventing deep zoom
        if ((scale - 0.1 >= self.MinScale()) && (scale - 0.1 <= self.MaxScale())) {
            var BBox = self.GetBoundingBoxForZoomPoint(self.ActiveLocation().X(), self.ActiveLocation().Y(), $(self.GetSelector()).width(), $(self.GetSelector()).height(), 0)
            self.Zoom.translate([-(BBox[0]), -(BBox[1])]).scale(BBox[6]);
            customZoom();
        }
    };

    self.ResetMapZoom = function () {
        if (self.Svg()) {
            //self.Svg().attr("transform", "translate( " + self.Reset()[0] + "," + self.Reset()[1] + ")scale(" + self.ResetScale() + ")");
            MapGroup().attr("transform", "translate( " + self.Reset()[0] + "," + self.Reset()[1] + ")scale(" + self.ResetScale() + ")");
            self.Zoom.translate([self.Reset()[0], self.Reset()[1]]);
            self.Zoom.scale(self.ResetScale());
            customZoom();
        }
    };

    self.SvgRotateDegree = function (degrees) {
        if (!self.Translate()) self.Translate([]);
        if (self.Translate().length < 2) {
            self.Translate([]);
            self.Translate.push(0);
            self.Translate.push(0);
        }
        if (self.RotateX() == 0)
            self.RotateX(self.SvgWidth() / 2);
        if (self.RotateY() == 0)
            self.RotateY() = self.SvgHeight() / 2;
        var compass = d3.select(self.GetSelector(MapConstants.GroupOfCompassIdSuffix));
        var compassBBox = compass.node().getBBox();
        compass.attr("transform", "translate(10, 70)rotate(" + degrees + ", " + (compassBBox.width / 2) + ", " + (compassBBox.height / 2) + ")");
        //self.Svg().attr("transform", "translate(" + (self.Translate()[0]) + "," + (self.Translate()[1]) + ") scale(" + self.CurrentScale() + ") rotate(" + degrees + ", " + self.RotateX() + ", " + self.RotateY() + ")");
        MapGroup().attr("transform", "translate(" + (self.Translate()[0]) + "," + (self.Translate()[1]) + ") scale(" + self.CurrentScale() + ") rotate(" + degrees + ", " + self.RotateX() + ", " + self.RotateY() + ")");

        //self.Svg().selectAll('#Labels g.movableText').each(function () {
        //	var g = d3.select(this);
        //	var transform = g.attr('transform');
        //	var myRotation = g.attr('data-rotation');
        //	var myBBox = g.node().getBBox();
        //	g.attr('transform', transform.substring(0, transform.indexOf('rotate(') + 7) + (myRotation - degrees) + ',' + (myBBox.width / 2) + ',' + (myBBox.height / 2) + ')');
        //});
        customZoom();
    };

    self.RotateMapToRight = function () {
        self.MapRotation(self.MapRotation() + 30);
        if (self.MapRotation() == 360) self.MapRotation(0);
        self.SvgRotateDegree(self.MapRotation());
    };

    self.RotateMapToLeft = function () {
        self.MapRotation(self.MapRotation() - 30);
        if (self.MapRotation() == -30) self.MapRotation(330);
        self.SvgRotateDegree(self.MapRotation());
    }

    self.GetBoundingBoxForZoomPoint = function (x, y, w, h, zoomType, newScale) {
        var xShift, yShift;
        xShift = 50;
        yShift = 20;
        var width = w ? w : $(self.GetSelector()).width();
        var height = h ? h : $(self.GetSelector()).height();
        width = (width * (100 - self.BBoxPadding()) / 100) * (self.BBoxPadding()) / 2 / 100;
        height = (height * (100 - self.BBoxPadding()) / 100) * (self.BBoxPadding()) / 2 / 100;

        self.Width(width);
        self.Height(height);

        var gbb = self.GetBoundingBoxPoint(x, y, false, self.GetSelector(null), h, w, self.Zoom.scale());
        var scale = self.Zoom.scale();
        if (zoomType == 1) scale = scale + 0.1; 	//Scale up
        else if (zoomType == 0) scale = scale - 0.1; //Scale down
        else scale = newScale || scale;
        if (scale < self.MinScale()) {
            scale = self.MinScale();
        }
        else if (scale > self.MaxScale()) {
            scale = self.MaxScale();
        }

        if ((scale >= self.MinScale()) && (scale <= self.MaxScale())) {
            gbb[0] = gbb[7] * scale - (self.Width()) / 2 - xShift * scale;
            gbb[1] = gbb[8] * scale - (self.Height()) / 2 - yShift * scale;
            gbb[6] = scale;
        }
        return gbb;
    }

    // End : Control Toolbox Features


    // Start : Zoom & Scale Feature

    function customZoom() {
        var mapContainerSelector = self.GetSelector();
        var mainSvgSelector = self.GetSelector(MapConstants.MainSvgIdSuffix);
        var youAreHereSelector = self.GetSelector(MapConstants.YouAreHereIdSuffix);
        var alertZoneSelector = self.GetSelector(MapConstants.AlertZoneIdSuffix);
        var pathGroupSelector = self.GetSelector(MapConstants.PathGroupIdSuffix);

        if (self.RotateX() == 0) {
            self.RotateX(self.SvgWidth() / 2);
        }
        if (self.RotateY() == 0) {
            self.RotateY(self.SvgHeight() / 2);
        }

        if ((!!self.Zoom.translate()) && (!!self.Zoom.scale() || self.Zoom.scale() == 0)) {
            //calculate the centroid
            var translate = self.Zoom.translate();
            var scale = Math.min(self.MaxScale(), Math.max(self.MinScale(), self.Zoom.scale()));

            //$("#SVGBox").width()
            var tx = Math.min(Math.max(self.SvgWidth() * scale * (-0.9), translate[0]), $(mapContainerSelector).width() * 0.9),
				ty = Math.max(self.SvgHeight() * scale * (-0.9), Math.min($(mapContainerSelector).height() * 0.9, translate[1]));

            self.CurrentScale(scale);
            if (tx && ty) {

                //self.Svg().attr("transform", "translate(" + (tx) + "," + (ty) + ") scale(" + scale + ") rotate(" + self.MapRotation() + ", " + self.RotateX() + ", " + self.RotateY() + ")");
                MapGroup().attr("transform", "translate(" + (tx) + "," + (ty) + ") scale(" + scale + ") rotate(" + self.MapRotation() + ", " + self.RotateX() + ", " + self.RotateY() + ")")
                $(youAreHereSelector + ' circle').attr("r", 15 / scale);
                $(youAreHereSelector + ' text').attr("r", 20 / scale);
                $(alertZoneSelector + ' circle').attr("r", 15 / scale);
                $(alertZoneSelector + ' text').attr("r", 20 / scale);
                $(pathGroupSelector + " circle").attr("r", self.DefaultSize() / scale);
                $(pathGroupSelector + " text").attr("font-size", self.DefaultSize() / scale)
											  .attr("transform", function () {
											      return customTransformForLabelTranslate(scale);
											  });
            } else {
                //This is where it has issues
                var attribute = $('svg' + mainSvgSelector + ' g')[0].attributes[0];
                var currentTransform = "";
                if (attribute) currentTransform = attribute.value.split('scale')[0];
                //self.Svg().attr("transform", currentTransform + " scale(" + scale + ") rotate(" + self.MapRotation() + ", " + self.RotateX() + ", " + self.RotateY() + ")");
                MapGroup().attr("transform", currentTransform + " scale(" + scale + ") rotate(" + self.MapRotation() + ", " + self.RotateX() + ", " + self.RotateY() + ")");
                $(youAreHereSelector + ' circle').attr("r", 15 / scale);
                $(youAreHereSelector + ' text').attr("r", 20 / scale);
                $(alertZoneSelector + ' circle').attr("r", 15 / scale);
                $(alertZoneSelector + ' text').attr("r", 20 / scale);
                $(pathGroupSelector + "  circle").attr("r", self.DefaultSize() / scale);
                $(pathGroupSelector + "  text").attr("font-size", self.DefaultSize() / scale)
									.attr("transform", function () {
									    return customTransformForLabelTranslate(scale);
									});
            }
            setSlider(scale);
        }
    }

    function setSlider(scale) {
        var xScale = -35 + ((35 + 40) * (self.MaxScale() - scale) / (self.MaxScale() - self.MinScale()));
        self.XScale(xScale);

        d3.select(self.GetSelector(MapConstants.SlideMoverIdSuffix)).attr("transform", "translate( " + self.XScale(xScale) + " ,0)");
    }

    function customTransformForLabelTranslate(scale) {
        var translateTxt = "";
        if (scale < 0.30) {
            translateTxt = "translate(" + (1 / scale) * -3 + "," + (1 / scale) * 3 + ")";
        }
        else
            if (scale > 0.30 && scale < 0.90) {
                translateTxt = "translate(" + (1 / scale) * (-1.5) + "," + (1 / scale) * (1.5) + ")";
            } else
                if (scale > 1.30) {
                    translateTxt = "translate(" + (0.95) * scale + "," + (-0.95) * scale + ")";
                }
        return translateTxt;
    }

    // End : Zoom & Scale Feature


    // Start : Location marker functions

    self.DrawLocationMarker = function (locationMarker) {
        //$(self.GetSelector()).is(':visible') &&
        if (self.IsMapLoaded() && locationMarker.IsQuickLinkDataLoaded() && locationMarker.CurrentFloor() > 0 && locationMarker.StartingFloor() == locationMarker.CurrentFloor()) {
            self.CenterMap();
            locationMarker.IsVisible(true);
        }
        else {
            setTimeout(function () { self.DrawLocationMarker(locationMarker); }, 500);
        }
    }

    function createLocationMarker(locationMarkerType) {
        var locMarker = new LocationMarker();
        locMarker.MessageBoxCssClass = "youareherePopUp";
        locMarker.FloorChangeCallback = self.FloorChangeCallback;
        locMarker.Type = locationMarkerType;

        switch (locationMarkerType) {
            case LocationMarkerType.YouAreHere:
                locMarker.Id(self.GetSelector(MapConstants.YouAreHereIdSuffix, true));
                locMarker.BaseCircleCssClass("locationMarker");
                locMarker.MessageBoxArrowFillColor("#4AC45B");
                locMarker.MessageText("You are here");
                locMarker.MessageTextFillColor("#4AC45B");
                break;
            case LocationMarkerType.AlertZone:
                locMarker.Id(self.GetSelector(MapConstants.AlertZoneIdSuffix, true));
                locMarker.BaseCircleCssClass("locationMarker red");
                locMarker.MessageBoxArrowFillColor("#EE5B5B");
                locMarker.MessageText("Alert zone");
                locMarker.MessageTextFillColor("#EE5B5B");
                break;
        }
        return locMarker;
    }

    // End : Location marker functions



};