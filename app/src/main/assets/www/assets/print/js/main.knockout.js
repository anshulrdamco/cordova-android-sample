function MainViewModel() {
    var OrientationDirection = {
        North: "north",
        South: "south",
        East: "east",
        West: "west"
    }

    var self = this;
    self.AlertNotificationVM = ko.observable(new AlertModal());
    self.CurrentLanguage = ko.observable('english');
    self.CurrentHost = ko.observable('');
    self.ClientVM = new ClientViewModel();
    self.lookupVM = new LookupViewModel();
    self.currentLookupVM = ko.observable(new LookupViewModel());
    self.destinationListVM = new DestinationListViewModel();
    self.FloorFileName = "";
    self.StartingFloor = 0;
    self.CurrentFloor = ko.observable(0);
    self.DirectionsHeader = ko.observable("Your Directions");
    self.NavigateHeaderText = ko.observable("Get Directions");
    self.EventHeaderText = ko.observable("Events");
    self.NavigatePromptText = ko.observable("Where would you like to go?");
    self.SearchPlaceholderText = ko.observable("Search");
    self.LookupButtonText = ko.observable("Directory Lookup");
    self.FilterPlaceholderText = ko.observable("Filter Results");
    self.SelectDestinationText = ko.observable("Select a Destination");
    self.FilterButtonText = ko.observable("Filter Results");
    self.PreviousText = ko.observable("Previous");
    self.NextText = ko.observable("Next");
    self.TodaysEventButtonText = ko.observable("Go to Today's Events");
    self.EventDayText = ko.observable("Select a Different Day");
    self.SelectDateWithColon = ko.observable("Select a date to view");
    self.NoEventText = ko.observable("No events scheduled today");
    self.TimeColumnText = ko.observable("Time");
    self.EventColumnText = ko.observable("Event");
    self.LegendHeaderText = ko.observable("Map Legend");
    self.QuickDirectionsHeaderText = ko.observable("Quick Directions");
    self.MapOptionsHeaderText = ko.observable("Mapping Option");
    self.DirectionsSliderText = ko.observable("Get Your Directions");
    self.FloorListHeaderText = ko.observable("Select a floor to view");
    self.LoadingDirectionsText = ko.observable("Loading your directions, please wait");
    self.EmailPromptText = ko.observable("Enter your email");
    self.ScanQRPromptText = ko.observable("Scan QR to view Directions on your phone");
    self.SendMailButtonText = ko.observable("Send Email");
    self.DirectionsUnavailableText = ko.observable("Directions Unavailable");
    self.DirectionsUnavailableBody = ko.observable("Sorry directions are not available to this location. Check the details on the screen for more information.");
    self.MoreTimeText = ko.observable("Do you need more time?");
    self.YesText = ko.observable("Yes");
    self.MainMenuText = ko.observable("Main Menu");
    self.DirectionsText = ko.observable("Directions");
    self.FromText = ko.observable("From");
    self.ToText = ko.observable("To");
    self.EmailErrorText = ko.observable("Invalid email");
    self.IsPortrait = ko.observable(window.orientation == 'portrait');
    self.StepText = ko.observable("Step");
    self.ContentsGeofences = ko.observable(new ContentGeofenceViewModel());
    self.CurrentLanguage.subscribe(function (newVal) {
        setupPopover();
        self.lookupVM.CurrentLanguage(newVal);
        for (var i = 0; i < self.FloorList().length; i++) {
            self.FloorList()[i].CurrentLanguage(newVal);
        }
        TranslateText(newVal, "Your Directions", self.DirectionsHeader);
        TranslateText(newVal, "Navigate", self.NavigateHeaderText);
        TranslateText(newVal, "Events", self.EventHeaderText);
        TranslateText(newVal, "Where would you like to go?", self.NavigatePromptText);
        TranslateText(newVal, "Search", self.SearchPlaceholderText);
        TranslateText(newVal, "Directory Lookup", self.LookupButtonText);
        TranslateText(newVal, "Filter Results", self.FilterPlaceholderText);
        TranslateText(newVal, "Select a Destination", self.SelectDestinationText);
        TranslateText(newVal, "Filter Results", self.FilterButtonText);
        TranslateText(newVal, "Previous", self.PreviousText);
        TranslateText(newVal, "Next", self.NextText);
        TranslateText(newVal, "Go to Today's Events", self.TodaysEventButtonText);
        TranslateText(newVal, "Select a Different Day", self.EventDayText);
        TranslateText(newVal, "Select a date to view", self.SelectDateWithColon);
        TranslateText(newVal, "No events scheduled today", self.NoEventText);
        TranslateText(newVal, "Time", self.TimeColumnText);
        TranslateText(newVal, "Event", self.EventColumnText);
        TranslateText(newVal, "Map Legend", self.LegendHeaderText);
        TranslateText(newVal, "Quick Directions", self.QuickDirectionsHeaderText);
        TranslateText(newVal, "Mapping Option", self.MapOptionsHeaderText);
        TranslateText(newVal, "Get Your Directions", self.DirectionsSliderText);
        TranslateText(newVal, "Select a floor to view", self.FloorListHeaderText);
        TranslateText(newVal, "Loading your directions, please wait", self.LoadingDirectionsText);
        TranslateText(newVal, "Enter your email", self.EmailPromptText);
        TranslateText(newVal, "Scan QR to view Directions on your phone", self.ScanQRPromptText);
        TranslateText(newVal, "Send Email", self.SendMailButtonText);
        TranslateText(newVal, "Directions Unavailable", self.DirectionsUnavailableText);
        TranslateText(newVal, "Sorry directions are not available to this location. Check the details on the screen for more information.", self.DirectionsUnavailableBody);
        TranslateText(newVal, "Do you need more time?", self.MoreTimeText);
        TranslateText(newVal, "Yes", self.YesText);
        TranslateText(newVal, "Main Menu", self.MainMenuText);
        TranslateText(newVal, "Directions", self.DirectionsText);
        TranslateText(newVal, "From", self.FromText);
        TranslateText(newVal, "To ", self.ToText);
        TranslateText(newVal, "Invalid email", self.EmailErrorText);
        TranslateText(newVal, "Step", self.StepText);
    });
    self.CurrentFloorName = ko.computed(function () {
        self.CurrentFloor();
        if (self.FloorList) {
            for (var i = 0; i < self.FloorList().length; i++) {
                if (self.FloorList()[i].ID == self.CurrentFloor()) {
                    return self.FloorList()[i].Name();
                }
            }
        }
        return "";
    });
    self.DirectionsHeaderWithColon = ko.computed(function () {
        return self.DirectionsHeader() + ":";
    });
    self.SearchPlaceholderTextWithEllipsis = ko.computed(function () {
        return self.SearchPlaceholderText() + "...";
    });
    self.FilterPlaceholderTextWithEllipsis = ko.computed(function () {
        return self.FilterPlaceholderText() + "...";
    });
    self.FloorListHeaderTextWithColon = ko.computed(function () {
        return self.FloorListHeaderText() + ":";
    });
    self.EmailPromptTextWithColon = ko.computed(function () {
        return self.EmailPromptText() + ":";
    });
    self.DirectionsTextWithColon = ko.computed(function () {
        return self.DirectionsText() + ":";
    });
    self.FromTextWithColon = ko.computed(function () {
        return self.FromText() + ":";
    });
    self.ToTextWithColon = ko.computed(function () {
        return self.ToText() + ":";
    });
    self.CountdownTimer = ko.observable(5);
    self.FloorList = ko.observableArray([]);
    self.HoldUpdating = false;
    self.YouAreHere = { x: 0, y: 0 };
    self.LastUserInteraction = -1;
    self.IsBaseState = ko.observable(true);
    self.SearchTerm = ko.observable('');
    self.AutoCompleteHeader = ko.observable('Recommended Destinations');
    self.TopDestinations = ko.observableArray();
    self.SearchResults = ko.observableArray();
    self.SelectedDestination = ko.observable({ DisplayName: ko.observable(''), name: ko.observable('') });
    self.EventsList = ko.observableArray([]);
    self.CurrentEventDate = ko.observable(new Date());
    self.HasDirections = ko.observable(false);
    self.directionsHTML = ko.observable('');
    self.svgDivs = ko.observableArray([]);
    self.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    self.ShortestPath = null;
    self.WalkingDirections = null;
    self.ClosestRestroomQL = ko.observable('');
    self.Note = ko.observable('');
    self.ShortNote = ko.observable('');
    self.RRName = null;
    self.EDName = null;
    self.lookupBreadcrumb = ko.observableArray([]);
    self.CurrentLocation = ko.observable('');
    self.GettingDirections = false;
    self.emailToSendTo = ko.observable('');
    self.KioskEmail = ko.observable(false);
    self.KioskPrint = ko.observable(false);
    self.KioskPrintPopupMsg = ko.observable("Your directions are being printed.");
    self.KioskOrientation = 'North';
    self.KioskLiveConnect = ko.observable(false);
    self.KioskLiveConnectURL = ko.observable('');
    self.KioskAvatarGreeting = ko.observable(false);
    self.KioskAvatarMenus = ko.observable(false);
    self.LiveConnectAvailableForThisLanguage = ko.observable(true);
    self.QRAddressBase = ko.observable("");
    self.EmailErrorVisible = ko.observable(false);
    $('#qrCodeImage, #qrCodeLandscape').load(function () {
        self.IsQRLoaded(true);
        console.log("image loaded correctly");
    });
    $('#qrCodeImage, #qrCodeLandscape').error(function () {
        self.IsQRLoaded(false);
        if ($('#qrCodeImage').attr("src") == '#') return;
        setTimeout(function () {
            $('#qrCodeImage, #qrCodeLandscape').attr("src", $('#qrCodeImage').attr("src") + "?rand=" + Math.round(Math.random() * 10000));
        }, 1000);
        console.log("error loading image");
    });
    self.IsQRLoaded = ko.observable(true);
    self.QRAddress = ko.computed(function () {
        if (self.CurrentLocation()) {
            if (self.SelectedDestination()) {
                if (self.SelectedDestination().name()) {
                    var retVal = "https://chart.googleapis.com/chart?cht=qr&chs=236x236&chl=" + encodeURIComponent(self.QRAddressBase()) +
							encodeURIComponent(self.QRAddressBase()[self.QRAddressBase().length - 1] == '/' ? '' : '/') +
							encodeURIComponent("#walkingdirections?from=") + encodeURIComponent(encodeURIComponent(self.CurrentLocation()))
							+ encodeURIComponent("&to=") + encodeURIComponent(encodeURIComponent(self.SelectedDestination().name()));
                    $('#qrCodeImage').attr("src", retVal);
                    $('#qrCodeLandscape').attr("src", retVal);
                    return retVal;
                }
            }
        }
        return "#";

    });

    self.IsValidEmail = function (email) {
        return email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/);
    }

    self.IsOnline = ko.observable(true);
    self.IsOnline.subscribe(function (newVal) {
        if (newVal) {
            if (!IsImageOk(document.getElementById('qrCodeImage'))) {
                $('#qrCodeImage').attr("src", $('#qrCodeImage').attr("src") + "?rand=" + Math.round(Math.random() * 10000));
            }
            if (!IsImageOk(document.getElementById('qrCodeLandscape'))) {
                $('#qrCodeLandscape').attr("src", $('#qrCodeLandscape').attr("src") + "?rand=" + Math.round(Math.random() * 10000));
            }
        }
    });
    self.EmailHref = ko.computed(function () {
        if (self.CurrentLocation()) {
            if (self.SelectedDestination()) {
                if (self.SelectedDestination().name()) {
                    if (self.IsValidEmail(self.emailToSendTo())) {
                        return ('mailto:' + encodeURIComponent(self.emailToSendTo())
						+ '?subject=' + encodeURIComponent('Directions to ' + self.SelectedDestination().DisplayName())
						+ '&body=' + encodeURIComponent('From: \r\n\t' + self.CurrentLocation() + ' \r\n'
														+ 'To: \r\n\t' + self.SelectedDestination().DisplayName() + ' \r\n'
														+ ' \r\n'
														//+ 'Interactive Directions: \r\n\thttp://' + getParameterByName(window.location.href, 'host') + '.yourdirectroute.com/#walking?from=' + encodeURIComponent(self.CurrentLocation())
														//        + '&to=' + encodeURIComponent(self.SelectedDestination().name()) + ' \r\n'
														//+ 'Printer Friendly Directions: \r\n\thttp://' + getParameterByName(window.location.href, 'host') + '.yourdirectroute.com/#printable?printing=3&from=' + encodeURIComponent(self.CurrentLocation())
														//        + '&to=' + encodeURIComponent(self.SelectedDestination().name()) + ' \r\n'
														 + 'Interactive Directions: \r\n\thttp://' + self.CurrentHost + '.yourdirectroute.com/#walking?from=' + encodeURIComponent(self.CurrentLocation())
																+ '&to=' + encodeURIComponent(self.SelectedDestination().name()) + ' \r\n'
														+ 'Printer Friendly Directions: \r\n\thttp://' + self.CurrentHost + '.yourdirectroute.com/#printable?printing=3&from=' + encodeURIComponent(self.CurrentLocation())
																+ '&to=' + encodeURIComponent(self.SelectedDestination().name()) + ' \r\n'
													   ));
                    }
                }
            }
        }
        return "#";
    });
    self.MapIndex = ko.observable(1);
    self.MapSteps = ko.observableArray([]);

    self.EmailClick = function () {
        if (self.IsValidEmail(self.emailToSendTo())) {
            if (self.CurrentLocation()) {
                if (self.SelectedDestination()) {
                    if (self.SelectedDestination().name()) {
                        var start_location_name = self.CurrentLocation();
                        var fromReference = 'from';
                        var toReference = 'to';
                        var end_location_name = !self.SelectedDestination() ? null : typeof self.SelectedDestination().name == 'function' ? self.SelectedDestination().name() : self.SelectedDestination().name;
                        var selectedParkingID = 0;
                        var printing = 3;
                        var url = SENDDIRECTIONSURL + '?email=' + self.emailToSendTo() + '&host=' + self.CurrentHost + '.yourdirectroute.com'
							+ '&endDisplayName=' + encodeURIComponent(self.SelectedDestination().DisplayName()) + '&startDisplayName=' + encodeURIComponent(self.CurrentLocation())
							+ '&parking=' + encodeURIComponent(selectedParkingID) + '&printing=' + printing + '&from=' + encodeURIComponent(start_location_name) + '&to=' + encodeURIComponent(end_location_name)
							 + '&fromref=' + encodeURIComponent(fromReference) + '&toref=' + encodeURIComponent(toReference);
                        $.ajax(url);

                        self.SendReporting('SENDTOPHONE', "EMAIL", self.emailToSendTo(), "");
                        self.emailToSendTo("");
                        $('#EmailModal').modal('hide');
                        self.EmailErrorVisible(false);
                        return false;
                    }
                }
            }
        } else {
            self.EmailErrorVisible(true);
        }
    }

    self.EventPreviousVisible = ko.observable(false);
    self.EventNextVisible = ko.observable(true);

    self.EventScrollUp = function () {
        var current = $('#EventTableDiv').scrollTop();
        var height = $('#EventTableDiv').innerHeight();
        $('#EventTableDiv').scrollTop(current - height);
        self.EventPreviousVisible($('#EventTableDiv').scrollTop() > 0);
        self.EventNextVisible($('#EventTableDiv')[0].scrollHeight > $('#EventTableDiv').height() && $('#EventTableDiv').scrollTop() < ($('#EventTableDiv')[0].scrollHeight) - $('#EventTableDiv').height());
    }

    self.EventScrollDown = function () {
        var current = $('#EventTableDiv').scrollTop();
        var height = $('#EventTableDiv').innerHeight();
        $('#EventTableDiv').scrollTop(current + height);
        self.EventPreviousVisible($('#EventTableDiv').scrollTop() > 0);
        self.EventNextVisible($('#EventTableDiv')[0].scrollHeight > $('#EventTableDiv').height() && $('#EventTableDiv').scrollTop() < ($('#EventTableDiv')[0].scrollHeight) - $('#EventTableDiv').height());
    }

    self.DirectionPreviousVisible = ko.observable(false);
    self.DirectionNextVisible = ko.observable(true);

    self.DirectionScrollUp = function () {
        var current = $('#directionsSlideout .slideOutContent fieldset').scrollTop();
        var height = $('#directionsSlideout .slideOutContent fieldset').innerHeight();
        $('#directionsSlideout .slideOutContent fieldset').scrollTop(current - height);
        self.DirectionPreviousVisible($('#directionsSlideout .slideOutContent fieldset').scrollTop() > 0);
        self.DirectionNextVisible($('#directionsSlideout .slideOutContent fieldset')[0].scrollHeight > $('#directionsSlideout .slideOutContent fieldset').height() && $('#directionsSlideout .slideOutContent fieldset').scrollTop() < ($('#directionsSlideout .slideOutContent fieldset')[0].scrollHeight) - $('#directionsSlideout .slideOutContent fieldset').height() - 42);
    }

    self.DirectionScrollDown = function () {
        var current = $('#directionsSlideout .slideOutContent fieldset').scrollTop();
        var height = $('#directionsSlideout .slideOutContent fieldset').innerHeight();
        $('#directionsSlideout .slideOutContent fieldset').scrollTop(current + height);
        self.DirectionPreviousVisible($('#directionsSlideout .slideOutContent fieldset').scrollTop() > 0);
        self.DirectionNextVisible($('#directionsSlideout .slideOutContent fieldset')[0].scrollHeight > $('#directionsSlideout .slideOutContent fieldset').height() && $('#directionsSlideout .slideOutContent fieldset').scrollTop() < ($('#directionsSlideout .slideOutContent fieldset')[0].scrollHeight) - $('#directionsSlideout .slideOutContent fieldset').height() - 42);
    }
    self.AutoCompleteResults = ko.computed(function () {
        if (self.SearchTerm().length >= 2) {
            return self.SearchResults();
        } else {
            return self.TopDestinations();
        }
    });

    self.SearchTerm.subscribe(function (newValue) {
        self.GetSearchResults(newValue);
    });

    self.oldFloor = 0;

    self.CurrentFloor.subscribe(function (newValue) {
        if (!self.HoldUpdating && newValue != 0 && newValue != self.oldFloor) {
            $('#SVGBox').empty();
            BACKGROUND_MAP_LOADED = false;
            self.LoadBackgroundMap(newValue);
            self.oldFloor = newValue;
            if (self.StartingFloor != newValue) self.IsBaseState(false);
        }
    });

    self.ChangeFloor = function (Floor, event) {
        self.CurrentFloor(Floor.ID);
        $('#floorListModal').modal('hide');
    }

    self.EventsClick = function (event, evt) {
        self.SendReporting('EVENTS', 'DESTINATIONCLICK', "", event.QuickLink);
        self.SelectedDestination({ QuickLink: ko.observable(event.QuickLink), name: ko.observable(event.Title), DisplayName: ko.observable(event.Title) });
        self.GetDirections(event.QuickLink);
    }

    self.GetSearchResults = function (searchString) {
        TranslateText(self.CurrentLanguage(), 'Recommended Destinations', self.AutoCompleteHeader);
        if (searchString.length >= 2) {
            TranslateText(self.CurrentLanguage(), 'Searching...', self.AutoCompleteHeader);
            //self.searchCategoryVMs[searchString.substring(0, self.searchLength)] = new Array();
            $.support.cors = true;
            GetSearchDestinations(self.ClientVM.clientID(), searchString, function (jsonObject) {
                if (Array.isArray(jsonObject)) {
                    self.SearchResults.removeAll();
                    for (var i = 0; i < jsonObject.length; i++) {
                        var dvm = new DestinationViewModel([]);
                        dvm.name(jsonObject[i].UniqueName);
                        dvm.DisplayName(jsonObject[i].DisplayName);
                        dvm.QuickLink(jsonObject[i].QuickLink);
                        if (dvm.name().toLowerCase().indexOf(self.SearchTerm().toLowerCase()) >= 0)
                            self.SearchResults.push(dvm);
                    }
                    if (self.SearchResults().length == 0) {
                        self.AutoCompleteHeader(TranslateText(self.CurrentLanguage(), 'No results found.'));
                    } else {
                        self.AutoCompleteHeader(TranslateText(self.CurrentLanguage(), 'Were you looking for:'));
                    }
                    if (self.SearchTerm().length <= 1)
                        self.AutoCompleteHeader(TranslateText(self.CurrentLanguage(), 'Recommended Destinations'));
                }
            });
        }
    }

    self.GetTopDestinations = function () {
        if (PORTAL_PARAMETERS_LOADED) {
            GetSelectedDestinations(self.ClientVM.clientID(), 10, function (jsonObject) {
                var topDestinations = jsonObject.EndDestinations;
                if (topDestinations.length > 0) {
                    for (var i = 0; i < topDestinations.length; i++) {
                        var dvm = new DestinationViewModel([]);
                        dvm.QuickLink(topDestinations[i].QuickLink);
                        dvm.name(topDestinations[i].DestinationName);
                        dvm.DisplayName(topDestinations[i].DestinationText);
                        self.TopDestinations.push(dvm);
                    }
                }
            });
        } else {
            setTimeout(self.GetTopDestinations, 100);
        }
    }

    self.GetFloorList = function () {
        if (PORTAL_PARAMETERS_LOADED) {
            GetFloorList(self.ClientVM.clientID(), function (jsonObject) {
                self.FloorList.removeAll();
                for (var i = 0; i < jsonObject.length; i++) {
                    var flvm = new FloorViewModel();
                    flvm.EnglishName(jsonObject[i].Name);
                    flvm.ID = jsonObject[i].ID;
                    self.FloorList.push(flvm);
                }
                self.CurrentFloor(self.StartingFloor);
            });
        } else {
            setTimeout(self.GetFloorList, 100);
        }
    }

    self.LoadBackgroundMap = function (map) {
        if (PORTAL_PARAMETERS_LOADED && map) {
            GetMapURL(map, function (data) {
                self.FloorFileName = data;
                MAP_NAME_FOUND = true;
                self.InsertSVG();
            });
        } else {
            setTimeout(function () { self.LoadBackgroundMap(map); }, 100);
        }
    }

    self.InsertSVG = function () {
        if (PORTAL_PARAMETERS_LOADED && MAP_NAME_FOUND && self.FloorFileName) {
            GetMapXML(self.FloorFileName + '.svg', function (data) {
                d3.select('#mainSVG').remove();
                MAPSVG = d3.select("#SVGBox").append("svg").attr("id", "mainSVG")
					.attr("width", "100%")
					.attr("height", "100%").attr("style", "overflow:hidden")
					.call(zm)
					.append("g");
                var importedNode;
                var xml = null;
                var xml = $.parseXML(data);
                if (xml && xml.documentElement) {
                    importedNode = document.importNode(xml.documentElement, true);
                } else if (xml) {
                    importedNode = importNode(xml.documentElement, true);
                }
                if (importedNode) {
                    MAPSVG.node().appendChild(importedNode);
                    BACKGROUND_MAP_LOADED = true;
                    DrawControls();
                    self.DrawYouAreHere();
                }
            });
        } else {
            setTimeout(self.InsertSVG, 100);
        }
    }

    self.GetContentsInSvg = function () { }



    self.GetQuicklinkData = function () {
        if (PORTAL_PARAMETERS_LOADED) {
            var loc = getParameterByName(window.location.href, "location");
            GetQuicklinkData(self.ClientVM.clientID(), loc, function (jsonObject) {
                if (jsonObject.result) {
                    if (self.StartingFloor == 0) self.StartingFloor = jsonObject.FloorID;
                    //self.HoldUpdating = true;
                    self.CurrentFloor(jsonObject.FloorID);
                    //self.HoldUpdating = false;
                    self.YouAreHere.x = jsonObject.X;
                    self.YouAreHere.y = jsonObject.Y;
                    //self.LoadBackgroundMap(jsonObject.FloorID);
                    self.ClosestRestroomQL(jsonObject.ClosestRR);
                    if (jsonObject.KioskEmail != null) self.KioskEmail((jsonObject.KioskEmail == "true") || (jsonObject.KioskEmail == "True"));
                    if (jsonObject.KioskPrint != null) self.KioskPrint((jsonObject.KioskPrint == "true") || (jsonObject.KioskPrint == "True"));
                    if (jsonObject.KioskPrintPopupMsg) {
                        self.KioskPrintPopupMsg(jsonObject.KioskPrintPopupMsg);
                    }

                    //orientation
                    if (jsonObject.Kiosk_Orientation) {
                        self.KioskOrientation = jsonObject.Kiosk_Orientation;
                    }
                    else {
                        self.KioskOrientation = 'North';
                    }


                    if (jsonObject.KioskLiveConnect != null) self.KioskLiveConnect((jsonObject.KioskLiveConnect == "true") || (jsonObject.KioskLiveConnect == "True"));
                    self.KioskLiveConnectURL(jsonObject.KioskLiveConnectURL);
                    var playVideoParam = getParameterByName(window.location.href, "avatarplay");
                    var isPlayVideo = (playVideoParam && playVideoParam.toLowerCase() == 'false') ? false : true;
                    if (jsonObject.KioskAvatarGreeting != null) {
                        if (isPlayVideo) {
                            self.KioskAvatarGreeting((jsonObject.KioskAvatarGreeting == "true") || (jsonObject.KioskAvatarGreeting == "True"));
                        }
                    }

                    if (jsonObject.KioskAvatarMenus != null) self.KioskAvatarMenus((jsonObject.KioskAvatarMenus == "true") || (jsonObject.KioskAvatarMenus == "True"));
                    self.QRAddressBase(jsonObject.QRAddressBase);
                    self.CurrentLocation(jsonObject.UniqueDestination);
                    self.RRName = jsonObject.RRName;
                    self.EDName = jsonObject.EDName;
                    QUICKLINK_DATA_LOADED = true;
                    //Only display the video if the avatar greeting is available
                    if (jsonObject.QRAddressBase != null) {
                        var host = jsonObject.QRAddressBase.split("/")[2].split(".")[0];
                        self.CurrentHost = host;
                        //OnPageLoad Video Update
                        if (self.KioskAvatarGreeting() && isPlayVideo) {
                            //var host = getParameterByName(window.location.href, "host");
                            var videoFile = 'https://ljwbk.blob.core.windows.net/media/' + host + '_greeting.mp4';
                            $('#avatarGreetingVideo source').attr('src', videoFile);
                            $('#avatarGreetingVideo')[0].load();
                            $('#avatarGreetingVideo')[0].play();
                        }
                    }
                    //load content and geofences
                    self.ContentsGeofences().Init(jsonObject.FloorID);
                    self.pushContentAndGeoFenceInMap();
                }
            });
        } else {
            setTimeout(self.GetQuicklinkData, 100);
        }

    }

    self.pushContentAndGeoFenceInMap = function (startingWaitTime) {
        if (!startingWaitTime && self.ContentsGeofences().IsEverythingLoaded() === 1) {
            var contentsAndGeofences = $('#contents-geofences svg g.data-container').clone().removeAttr('data-bind')
            $('#mainSVG g:first .data-container').remove();
            $('#mainSVG g:first').append(contentsAndGeofences);
        }
        else {
            setTimeout(self.pushContentAndGeoFenceInMap, startingWaitTime || 500);
        }
    }

    self.DrawYouAreHere = function () {
        var x = parseFloat(self.YouAreHere.x);
        var y = parseFloat(self.YouAreHere.y);

        if (BACKGROUND_MAP_LOADED && QUICKLINK_DATA_LOADED && self.StartingFloor == self.CurrentFloor()) {
            var group = MAPSVG.append('g').attr("id", "YouAreHere");
            //Add Node A
            group.append('circle').attr("r", 15).attr("cx", x).attr("cy", y).attr("class", "locationMarker");
            group.append('circle').attr("r", 30).attr("cx", x).attr("cy", y).attr("class", "locationMarkerPulse");
            group.append('path').attr("d", "M247,56.5H51.3c-5.5,0-9.8,4.7-9.8,10.2v18.8L27,96.4l14.5,10.1v16.2c0,5.5,4.3,9.8,9.8,9.8H247c5.5,0,9.5-4.3,9.5-9.8v-56C256.5,61.2,252.5,56.5,247,56.5z")
			.attr("fill", "#ffffff").attr('stroke', '#BCBCBC').attr('stroke-miterlimit', '10').attr("class", "youareherePopUp").attr("transform", "translate(" + (x - 10) + "," + (y - 95) + ")");
            group.append('polygon').attr('points', '100,85 76,85 76,76 58.3,94.5 76,113 76,105 100,105').attr('fill', '#4AC45B').attr("transform", "translate(" + (x - 20) + "," + (y - 95) + ")");
            group.append('text').attr("font-family", 'verdana').attr("font-size", 20).attr('font-weight', 'bold').text("You are here").attr("text-anchor", "start").attr("x", (x + 89)).attr("y", (y + 8)).attr('fill', '#4AC45B');


        } else if (self.StartingFloor > 0 && self.StartingFloor == self.CurrentFloor()) {
            setTimeout(self.DrawYouAreHere, 100);
            return;
        }
        self.CenterMap();
    }

    function isOrientationRequired() {
        return self.ContentsGeofences().Contents() && self.ContentsGeofences().Contents().length > 0;
    }

    function setTransformAtrribute_KioskMapRotation(BBox) {
        if (isOrientationRequired()) {
            if (RotateX == 0)
                RotateX = SVGWIDTH / 2;
            if (RotateY == 0)
                RotateY = SVGHEIGHT / 2;

            switch (self.KioskOrientation.toLowerCase()) {
                case OrientationDirection.North: {
                    Rotation = 0;
                    break;
                }
                case OrientationDirection.East: {
                    Rotation = 90;
                    break;
                }
                case OrientationDirection.South: {
                    Rotation = 180;
                    break;
                }
                case OrientationDirection.West: {
                    Rotation = 270;
                    break;
                }
            }

            var compass = d3.select('#gCompass');
            var compassBBox = compass.node().getBBox();
            compass.attr("transform", "translate(10, 70)rotate(" + Rotation + ", " + (compassBBox.width / 2) + ", " + (compassBBox.height / 2) + ")");
            MAPSVG.attr("transform", "translate(" + -BBox[0] + ", " + -BBox[1] + ")scale(" + ZOOM_SCALE + ")rotate(" + Rotation + ", " + RotateX + ", " + RotateY + ")");
            mainVM.ContentsGeofences().MapRotation(Rotation);
            mainVM.pushContentAndGeoFenceInMap(100);

        }
        else {
            MAPSVG.attr("transform", "translate(" + -BBox[0] + ", " + -BBox[1] + ")scale(" + ZOOM_SCALE + ")");
        }
    }

    self.CenterMap = function () {
        var x = self.YouAreHere.x;
        var y = self.YouAreHere.y;

        if (BACKGROUND_MAP_LOADED && !MAPHASPATH) {
            var BBox = getBoundingBoxPoint(x, y, null, 'mainSVG', SVGHEIGHT, SVGWIDTH, ZOOM_SCALE);
            RESET = [-(BBox[0]), -(BBox[1])];
            CURRENT_ZOOM = BBox[6];
            ZOOM_SCALE = BBox[6];
            RESET_SCALE = ZOOM_SCALE;
            zm.translate([-(BBox[0]), -(BBox[1])]).scale(ZOOM_SCALE);

            setTransformAtrribute_KioskMapRotation(BBox);

        } else if (BACKGROUND_MAP_LOADED && MAPHASPATH) {
            var propName = 'f' + self.MapIndex().toString();
            var BBox = getBoundingBox(self.ShortestPath[propName].pathpoints, null, null, null, true);
            RESET = [-(BBox[0]), -(BBox[1])];
            CURRENT_ZOOM = BBox[6];
            RESET_SCALE = CURRENT_ZOOM;
            ZOOM_SCALE = BBox[6];
            zm.translate([-(BBox[0]), -(BBox[1])]).scale(ZOOM_SCALE);
            setTransformAtrribute_KioskMapRotation(BBox);
        } else if (!BACKGROUND_MAP_LOADED) {
            setTimeout(self.CenterMap, 100);
            return;
        }
        $('#YouAreHere circle').attr("r", 15 / CURRENT_ZOOM);
        $('#YouAreHere text').attr("r", 20 / CURRENT_ZOOM);

        //added for fixed size at different zooms
        $("#pathGroup circle").attr("r", DEFAULTSIZE / CURRENT_ZOOM);
        $("#pathGroup text").attr("font-size", DEFAULTSIZE / CURRENT_ZOOM)
								.attr("transform", function () {
								    return CustomTransformForLabelTranslate(CURRENT_ZOOM);
								});

    }

    self.CountDown = function () {
        if (self.CountdownTimer() > 0) {
            self.CountdownTimer(self.CountdownTimer() - 1);
            setTimeout(self.CountDown, 1000);
        } else if (self.CountdownTimer() == 0) {
            Reload();
        }
    }

    self.PopulateLookup = function () {
        if (PORTAL_PARAMETERS_LOADED) {
            GetMenuItems(self.ClientVM.clientID(), function (jsonObject) {
                if (Array.isArray(jsonObject)) {
                    for (var i = 0; i < jsonObject.length; i++) {
                        var parent;
                        if (!jsonObject[i].ParentID) {
                            parent = self.lookupVM;
                        } else {
                            parent = FindParent(jsonObject[i].ParentID, self.lookupVM);
                        }
                        var livm = new LookupViewModel(jsonObject[i].ActionID);
                        livm.headerTextEnglish(jsonObject[i].MenuLabel.replace('&amp;', '&'));
                        livm.data_id = jsonObject[i].OnClick;
                        livm.ID = jsonObject[i].ID;
                        if (parent != null)
                            parent.subItems.push(livm);
                    }
                    self.currentLookupVM(self.lookupVM);
                }
                self.lookupVM.mainHeaderTextEnglish('PlaceHolder');
            });
        } else {
            setTimeout(self.PopulateLookup, 100);
        }
    }

    self.SelectData = function (DVM, event) {
        PlayClickSound();
        event.stopPropagation();
        self.SelectedDestination(DVM);
        self.SendReporting('SEARCH', 'DESTINATIONCLICK', "", self.SelectedDestination().QuickLink());
        self.GetDirections(self.SelectedDestination().QuickLink());
    }

    self.EDClick = function () {
        if (mainVM.IsBaseState()) {
            mainVM.SendReporting('MAINMENU', 'BUTTONCLICK', 'ED', "");
        }
        mainVM.IsBaseState(false);
        self.SelectedDestination({ name: ko.observable(self.EDName), DisplayName: ko.observable(self.EDName) });
        self.SendReporting('QUICK', 'DESTINATIONCLICK', "", "ED");
        self.GetDirections("ED");
    }

    self.RRClick = function () {
        if (mainVM.IsBaseState()) {
            mainVM.SendReporting('MAINMENU', 'BUTTONCLICK', 'RR', "");
        }
        mainVM.IsBaseState(false);
        self.SelectedDestination({ name: ko.observable(self.RRName), DisplayName: ko.observable(self.RRName) });
        self.SendReporting('QUICK', 'DESTINATIONCLICK', "", self.ClosestRestroomQL());
        self.GetDirections(self.ClosestRestroomQL());
    }

    self.FloorClick = function () {
        PlayClickSound();
        mainVM.IsBaseState(false);
        $('#floorListModal').modal('show');
        setTimeout(function () {
            $("#floorListModal").modal('hide');
        }, 50000);
    }

    self.LookupClick = function (data, event) {
        PlayClickSound();
        event.stopPropagation();
        if (data.hasSubItems()) {
            var sublist = $("ul[data-toggleID='" + data.ID + "']");
            self.currentLookupVM(data);
            self.lookupBreadcrumb.push(data.ID);
        } else {
            self.destinationListVM.Filter('');
            self.destinationListVM.ClientDestinationID(data.data_id);
            self.destinationListVM.headerText(typeof data.headerText == 'function' ? data.headerText() : data.headerText);
            self.destinationListVM.PopulateData();
            $('.dataListInner').show();
            $('.lookupInner').hide();
        }
    }

    self.GetDirections = function (QL) {
        $('#jKeyboard').hide();
        self.SearchTerm("");
        if (!QL || QL.length > 10) {
            $('#NoDirectionsModal').modal('show');
            setTimeout(function () {
                $("#NoDirectionsModal").hide();
                $('#NoDirectionsModal').modal('hide');
                self.GettingDirections = false;
                if (window.external && ('RestartTimeout' in window.external)) window.external.RestartTimeout();
            }, 8000);
            return;
        }
        $('#loadingModal').modal('show');
        setTimeout(function () {
            $("#loadingModal").hide();
            $('#loadingModal').modal('hide');
            self.GettingDirections = false;
            if (window.external && ('RestartTimeout' in window.external)) window.external.RestartTimeout();
        }, 8000);
        var loc = getParameterByName(window.location.href, "location");
        self.GettingDirections = true;
        self.currentLookupVM(self.lookupVM);
        if (window.external && ('HaltTimeout' in window.external)) window.external.HaltTimeout();
        GetDirections(self.ClientVM.clientID(), loc, QL, self.CurrentLanguage(), function (jsonObject) {
            if (jsonObject) {
                self.HasDirections(true);
                self.Note(jsonObject.Note);
                self.ShortNote(jsonObject.ShortNote);
                MAPHASPATH = true;
                self.RenderDirections(jsonObject.WalkingDirections);
                self.ShortestPath = jsonObject.ShortestPath;
                self.WalkingDirections = jsonObject.WalkingDirections;
                self.LoadFullMap(1);
                var count = 0;
                for (k in self.ShortestPath) if (self.ShortestPath.hasOwnProperty(k)) count++;
                self.svgDivs.removeAll();
                //mainVM.printableVM.numMapsShown = 0;
                self.MapSteps.removeAll();
                var stepNumber = 1;
                for (var i = 1; i <= count; i++) {
                    var propName = 'f' + stepNumber.toString()
                    if (self.ShortestPath && self.ShortestPath.hasOwnProperty(propName)) {
                        self.MapSteps.push(stepNumber);
                        stepNumber += 1;
                        var currentFileObject = self.ShortestPath[propName];
                        var array = currentFileObject.pathpoints.split(' ');
                        var xypoints1 = array[0].split(',');
                        var xypoints2 = array[array.length - 1].split(',');

                        var points = currentFileObject.pathpoints.split(/\s+|,/);
                        var x0 = points.shift(), y0 = points.shift();
                        var pathpoints_p = 'M' + x0 + ',' + y0 + 'L' + points.join(' ');
                        var mapHTML = '<div class="mappingParentDiv" onclick="LoadFullMap(' + (stepNumber - 1) + ');"><div class="mappingDiv map' + (stepNumber - 2) + '"></div><div class="pathingDiv PathBoxmap' + (stepNumber - 2) + '"></div></div>';
                        var BBox = getBoundingBox(currentFileObject.pathpoints, 250, 250, null, true);
                        var svgItem = { index: stepNumber - 2, title: currentFileObject.title, divHTML: ko.observable(mapHTML), mapFileName: currentFileObject.url, isRendered: false, divVisible: true, isMap: true, divClear: 'none', BBox: BBox, array: array, xypoints1: xypoints1, xypoints2: xypoints2, points: points, x0: x0, y0: y0, pathpoints_p: pathpoints_p };
                        self.svgDivs.push(svgItem);
                    }
                }
                mapCount = 0;
                setTimeout(function () {
                    while (self.svgDivs()[mapCount]) {
                        var item = self.svgDivs()[mapCount];
                        if (!item.isRendered) {
                            self.renderMiniSVG(item, 'mapDiv', function (item) {
                                if ($(".mapDiv" + item.index).length > 0) {
                                    $(".mapDiv" + item.index).html(item.mapHTML);
                                    if (isOrientationRequired()) {
                                        orientationNavigateMap(item);
                                    }
                                }
                            });
                        }
                        else if (item.isRendered && item.mapHTML) {
                            if ($(".mapDiv" + item.index).length > 0) {
                                $('.mapDiv' + item.index).html(item.mapHTML);
                                if (isOrientationRequired()) {
                                    orientationNavigateMap(item);
                                }
                            }
                        }
                        mapCount += 1;
                    }
                }, 300);
                $('#loadingModal').modal('hide');
                self.GettingDirections = false;
                if (window.external && ('RestartTimeout' in window.external)) window.external.RestartTimeout();
                ShowDirections();
                $('#directionsSlideout .slideOutContent fieldset').scrollTop(0);
                self.CenterMap();
                self.DirectionPreviousVisible($('#directionsSlideout .slideOutContent fieldset').scrollTop() > 0);
                self.DirectionNextVisible($('#directionsSlideout .slideOutContent fieldset')[0].scrollHeight > $('#directionsSlideout .slideOutContent fieldset').height() && $('#directionsSlideout .slideOutContent fieldset').scrollTop() < ($('#directionsSlideout .slideOutContent fieldset')[0].scrollHeight) - $('#directionsSlideout .slideOutContent fieldset').height() - 42);
            } else {
                $('#loadingModal').modal('hide');
                self.GettingDirections = false;
                if (window.external && ('RestartTimeout' in window.external)) window.external.RestartTimeout();
            }
        });
    }

    function orientationNavigateMap(item) {
        var pathh = d3.select("div[id^='DirectionListDiv'] .mapDiv" + item.index + " path.myPath");
        var pathhBBox = pathh.node().getBBox();
        var svgElement = d3.select("div[id^='DirectionListDiv'] .mapDiv" + item.index + " svg g");
        var transformAttr = svgElement.attr('transform');

        svgElement.attr("transform", transformAttr + "rotate(" + Rotation + ", " + (pathhBBox.x + (pathhBBox.width / 2)) + ", " + (pathhBBox.y + (pathhBBox.height / 2)) + ")");
    }

    self.renderMiniSVG = function (item, backupDivID, callback) {
        GetMapXML(item.mapFileName, function (data) {
            self.putMiniSVG(item, data, callback);
        });
    }

    self.putMiniSVG = function (item, data, callback) {
        var pathText = "";

        pathText += '<path class="myPath" d="' + item.pathpoints_p + '" fill="none" stroke-width="' + item.BBox[9] + '" stroke="#009eff"/>';
        //Add Node A
        pathText += '<circle r="' + DEFAULTSIZE / item.BBox[6] + '" cx="' + item.xypoints1[0].toString() + '" cy="' + item.xypoints1[1].toString() + '" fill="#66CC66" stroke="#e9e9e9" stroke-width=".5"/>';
        pathText += '<circle r="' + DEFAULTSIZE / item.BBox[6] + '" cx="' + item.xypoints1[0].toString() + '" cy="' + item.xypoints1[1].toString() + '" fill="#66CC66" stroke="#white" stroke-width="1"/>';
        pathText += '<text x="' + (item.xypoints1[0] - 4).toString() + '" y="' + (parseFloat(item.xypoints1[1]) + 3) + '" font-family="verdana" font-size="' + DEFAULTSIZE / item.BBox[6] + '" fill="white">' + self.alphabet[item.index] + '</text>';
        //Add Node B
        pathText += '<circle r="' + DEFAULTSIZE / item.BBox[6] + '" cx="' + item.xypoints2[0].toString() + '" cy="' + item.xypoints2[1].toString() + '" fill="#CC0033" stroke="#e9e9e9" stroke-width=".5"/>';
        pathText += '<circle r="' + DEFAULTSIZE / item.BBox[6] + '" cx="' + item.xypoints2[0].toString() + '" cy="' + item.xypoints2[1].toString() + '" fill="#CC0033" stroke="#white" stroke-width="1"/>';
        pathText += '<text x="' + (item.xypoints2[0] - 4).toString() + '" y="' + (parseFloat(item.xypoints2[1]) + 3) + '" font-family="verdana" font-size="' + DEFAULTSIZE / item.BBox[6] + '" fill="white">' + self.alphabet[item.index + 1] + '</text>';
        item.mapHTML = '<svg width="250" height="250" class="mapThumbnail"><g transform="translate( ' + (-item.BBox[0]).toString() + ', ' + (-item.BBox[1]).toString() + ')scale(' + item.BBox[6].toString() + ')">' + data + pathText + '</g></svg>';
        item.isRendered = true;

        if (callback) callback(item);
    }

    self.RenderDirectionSteps = function (directions) {
        if (typeof directions == 'object' && directions.length > 0) {
            var i = 0;
            var directionsList = "<ul class='directions'>";

            for (i = 0; i < directions.length; i++) {
                var direction = directions[i];
                var liclass = self.GetDirectionClass(direction.Direction);

                if (direction.Distance == 0 && direction.Direction === "") {
                    liclass = self.GetDirectionClass("START");
                    directionsList += self.ListItem(liclass, direction.Description, i + 1);
                    continue;
                }
                directionsList += self.ListItem(liclass, direction.Description, i + 1);
            }

            directionsList += "</ul>";

            return directionsList;
        } else {
            return false;
        }
    }

    self.GetDirectionClass = function (direction) {
        if (typeof (direction) == "undefined" || direction === null || direction === "") {
            return "";
        }

        switch (direction) {
            case "RIGHT":
            case "IMMEDIATE RIGHT":
            case "SLIGHT RIGHT":
                return "right";
                break;
            case "SLIGHT LEFT":
            case "LEFT":
            case "IMMEDIATE LEFT":
                return "left";
                break;
            case "PARKING":
                return "parking";
                break;
            case "GO STRAIGHT":
            case "STRAIGHT":
            case "CONTINUE":
                return "straight";
                break;
            case "FLOOR-FLOOR":
                return "elevator";
                break;
            case "START":
                return "start";
                break;
            case "END":
            case "Arrive at Destination":
                return "end";
                break;
            case "BACK":
                return "back";
                break;
        }
    }

    self.ListItem = function (liClass, liHtml, index) {
        var classString = "";
        if (liClass !== "") {
            classString = "class ='directionIcon " + liClass + "'";
        }
        return "<li class='directionItem'><span>" + index + ".</span><span " + classString + "></span><span>" + liHtml + "</span></li>";
    }

    self.RenderDirections = function (directionData) {
        var dHtml = "";

        var mapCount = 0;
        for (var key in directionData) {
            if (key.indexOf(self.StepText()) === 0) {
                dHtml += "<div class='printOverlay displayTableRows'><div class='directionsDiv'><h4>" + key + "</h4>";
                dHtml += self.RenderDirectionSteps(directionData[key]);
                dHtml += "</div>";
                /*if (jsonObject[key].length == 1 && jsonObject[key][0]["Direction"] == "FLOOR-FLOOR"
					&& (!self.filesObject || !self.filesObject['f' + (mapCount + 1)] || !self.filesObject['f' + (mapCount + 1)].pathpoints || self.filesObject['f' + (mapCount + 1)].pathpoints.split(' ').length == 1)
					) {
					dHtml += "<div class='mappingDiv'><img src='images/up_down.png'/></div>";
				} else {
				*/    dHtml += '<div class="mappingParentDiv" onclick="LoadFullMap(' + (mapCount + 1) + ');"><div class="mappingDiv mapDiv' + mapCount + '"></div><div class="pathingDiv PathBoxmapDiv' + mapCount + '"></div></div>';
                //dHtml = '<div class="mappingDiv mapDiv' + mapCount + '"></div><div class="pathingDiv PathBoxmapDiv' + mapCount + '"></div>';
                //dHtml += "<div class='mappingDiv mapDiv" + mapCount + "'></div>";
                //}
                dHtml += "<div class='clear'></div></div>";
                mapCount += 1;
                /*var printHTML = "<h4>" + key + "</h4>";
				printHTML += self.RenderPrintableDirectionSteps(jsonObject[key], true);
				mainVM.printableVM.walkingDivs.push({ divHTML: printHTML, divVisible: true, isMap: false, divClear: 'none' });
				*/
            }
        }
        mapCount = 0;
        self.directionsHTML(dHtml);
    }

    self.TodaysEvents = function () {
        if (PORTAL_PARAMETERS_LOADED) {
            GetTodayEvents(self.ClientVM.clientID(), new Date().toDateString(), function (jsonObject) {
                self.EventsList.removeAll();
                self.CurrentEventDate(new Date());
                if (jsonObject) {
                    for (var i = 0; i < jsonObject.length; i++) {
                        self.EventsList.push(jsonObject[i]);
                    }
                }
                $('#EventTableDiv').scrollTop(0);
                self.EventPreviousVisible($('#EventTableDiv').scrollTop() > 0);
                self.EventNextVisible($('#EventTableDiv')[0].scrollHeight > $('#EventTableDiv').height() && $('#EventTableDiv').scrollTop() < ($('#EventTableDiv')[0].scrollHeight) - $('#EventTableDiv').height());
            });
        }
        else {
            setTimeout(function () { self.TodaysEvents(); }, 100);
        }
    }

    self.GetEvents = function (date) {
        if (PORTAL_PARAMETERS_LOADED) {
            GetEventsOnline(self.ClientVM.clientID(), date.toDateString(), date.toDateString(), function (jsonObject) {
                self.EventsList.removeAll();
                self.CurrentEventDate(date);

                if (jsonObject) {
                    for (var i = 0; i < jsonObject.length; i++) {
                        self.EventsList.push(jsonObject[i]);
                    }
                }
                $('#EventTableDiv').scrollTop(0);
                self.EventPreviousVisible($('#EventTableDiv').scrollTop() > 0);
                self.EventNextVisible($('#EventTableDiv')[0].scrollHeight > $('#EventTableDiv').height() && $('#EventTableDiv').scrollTop() < ($('#EventTableDiv')[0].scrollHeight) - $('#EventTableDiv').height());
            });
        } else {
            setTimeout(function () { self.GetEvents(date); }, 100);
        }
        $("#eventModal").modal('hide');
    }

    self.GetTodayActiveEvents = function () {
        if (PORTAL_PARAMETERS_LOADED) {
            GetTodayEvents(self.ClientVM.clientID(), new Date().toDateString(), function (jsonObject) {
                self.AlertNotificationVM().GetTodayEvents(jsonObject);
            });
        }
        else {
            setTimeout(function () { self.GetTodayActiveEvents(); }, 100);
        }

    }

    self.DifferentDayModal = function () {
        PlayClickSound();
        mainVM.IsBaseState(false);
        $('#eventModal').modal('show');
        setTimeout(function () {
            $("#eventModal").modal('hide');
        }, 50000);

    }


    self.LoadFullMap = function (mapIndex) {
        self.MapIndex(mapIndex);
        var propName = 'f' + mapIndex.toString();
        self.CurrentFloor(self.ShortestPath[propName].floorid);
        self.DrawPath(mapIndex);
    }

    self.DrawPath = function (mapIndex) {
        if (BACKGROUND_MAP_LOADED && MAPHASPATH) {
            var propName = 'f' + mapIndex.toString();
            var BBox = getBoundingBox(self.ShortestPath[propName].pathpoints, null, null, null, true);
            CURRENT_ZOOM = BBox[6];
            var array = self.ShortestPath[propName].pathpoints.split(' ');
            var xypoints1 = array[0].split(',');
            var xypoints2 = array[array.length - 1].split(',');

            //Check if

            var points = self.ShortestPath[propName].pathpoints.split(/\s+|,/);
            var x0 = points.shift(), y0 = points.shift();
            var pathpoints_p = 'M' + x0 + ',' + y0 + ' L ' + points.join(' ');

            d3.select("#pathGroup").remove();
            var group = MAPSVG.append('g').attr("id", "pathGroup");
            self.path = group.append('path').attr("id", "mainpath").attr("d", pathpoints_p).attr("fill", "none").attr("stroke-width", BBox[9]).attr("stroke", "#009eff");
            //Add Node A
            group.append('circle').attr("r", DEFAULTSIZE / BBox[6]).attr("cx", xypoints1[0]).attr("cy", xypoints1[1]).attr("fill", "#66CC66").attr("stroke", "#e9e9e9").attr("stroke-width", ".5");
            group.append('circle').attr("r", DEFAULTSIZE / BBox[6]).attr("cx", xypoints1[0]).attr("cy", xypoints1[1]).attr("fill", "#66CC66").attr("stroke", "#white").attr("stroke-width", "1");
            group.append('text').attr("x", ((xypoints1[0]) - 4)).attr("y", (parseFloat(xypoints1[1]) + 3))
                .attr("font-family", 'verdana').attr("font-size", DEFAULTSIZE / BBox[6]).text(self.alphabet[mapIndex - 1]).attr("fill", "white");
            //Add Node B
            group.append('circle').attr("r", DEFAULTSIZE / BBox[6]).attr("cx", xypoints2[0]).attr("cy", xypoints2[1]).attr("fill", "#CC0033").attr("stroke", "#e9e9e9").attr("stroke-width", ".5");
            group.append('circle').attr("r", DEFAULTSIZE / BBox[6]).attr("cx", xypoints2[0]).attr("cy", xypoints2[1]).attr("fill", "#CC0033").attr("stroke", "#white").attr("stroke-width", "1");

            group.append('text').attr("x", ((xypoints2[0]) - 4)).attr("y", (parseFloat(xypoints2[1]) + 3))
                .attr("font-family", 'verdana').attr("font-size", DEFAULTSIZE / BBox[6]).text(self.alphabet[mapIndex]).attr("fill", "white");
            /*if ((self.currentStepNumber == 1 && mainVM.start_location().isOffCampus()) || (mainVM.end_location().isOffCampus() && self.currentStepNumber == self.stepCount)) {
                self.object = group.append('path').attr('d', "m8.39619,-2.25244l-1.95614,-5.11237c-0.07913,-0.25598 -0.30347,-0.43985 -0.57395,0.43985l-11.30468,0c-0.26062,0 -0.48821,0.18387 -0.574,0.43985l-1.94953,5.11237l16.3583,0zm1.97261,4.27953c0,-1.19338 -0.884,-2.14879 -1.97592,-2.14879c-1.08858,0 -1.97261,0.95541 -1.97261,2.14879c0,1.18611 0.88402,2.15596 1.97261,2.15596c1.09192,0 1.97592,-0.96985 1.97592,-2.15596m-18.46285,2.15596c1.08854,0 1.97591,-0.96985 1.97591,-2.15596c0,-1.19338 -0.88737,-2.1...(line truncated)...
                    .attr('fill', "#009eff").attr('stroke', "#000000").attr("stroke-width", 0.25).attr('opacity', 7).attr("stroke-linecap", "round").attr("stroke-linejoin", "round").attr("stroke-miterlimit", 4).attr("stroke-dashoffset", 0);//.attr("transform","translate(" + x0 + "," + y0 + ")")
                //.append('animateMotion').attr('repeatCount',"indefinite").attr('dur',"19s").attr('path', pathpoints_p).attr('id','animationelement');
            }
            else {
                self.object = group.append('path').attr('d', "m3.70892,5.42856l0,7.77154l-2.5793,0l0,-7.74314l-0.60813,0l0,7.74314l-2.5793,0l0,-7.77154l0,-6.65473l-0.67366,0l0,5.71892l-1.7405,0l0,-5.76506c0,-0.94397 0.86251,-1.97926 1.90826,-1.97926l6.77721,0c1.06548,0 1.90826,1.0932 1.90826,2.05498l0,5.68935l-1.7405,0l0,-5.71892l-0.67235,0l0,6.65473l0.00001,-0.00001zm-2.87681,-13.79096c-1.54532,0 -2.79948,1.1321 -2.79948,2.52702c0,1.39492 1.25417,2.52702 2.79948,2.52702c1.54531,0 2.79948,-1.1321 2.79948,-2...(line truncated)...
                    .attr('fill', "#009eff").attr('stroke', "#000000").attr("stroke-width", 0.25).attr('opacity', 7).attr("stroke-linecap", "round").attr("stroke-linejoin", "round").attr("stroke-miterlimit", 4).attr("stroke-dashoffset", 0);//.attr("transform","translate(" + x0 + "," + y0 + ")")
                //.append('animateMotion').attr('repeatCount',"indefinite").attr('dur',"19s").attr('path',pathpoints_p).attr('id','animationelement');
            //}
            self.transition();*/
            self.CenterMap();
        } else {
            setTimeout(function () { self.DrawPath(mapIndex); }, 100);
        }
    }

    self.BackButtonClick = function () {
        self.destinationListVM.Filter('');
        if (self.lookupBreadcrumb().length > 1) {
            var id = self.lookupBreadcrumb.pop();
            self.currentLookupVM(FindMyParent(id, self.lookupVM));
        } else {
            var id = self.lookupBreadcrumb.pop();
            self.currentLookupVM(self.lookupVM);
            $('.dataListInner').hide();
            $('.lookupInner').hide();
            if ($('#navSlideout').hasClass('extra')) {
                $('.slideout').removeClass('extra');
            } else {
                $('.slideout').addClass('extra');
            }
        }
    }

    self.MapStepClick = function (data, event) {
        PlayClickSound();
        self.LoadFullMap(data);
    }

    self.RotateLeftSVG = function () {
        SVGRotateLeft();
    }

    self.RotateRightSVG = function () {
        SVGRotateRight();
    }

    self.ZoomInSVG = function () {
        SVGZoomIn();
    }

    self.ZoomOutSVG = function () {
        SVGZoomOut();
    }

    self.ResetSVG = function () {
        SVGResetZoom();
    }

    self.PrintClick = function () {
        PlayClickSound();
        self.SendReporting('MAP', 'BUTTONCLICK', 'Print', "");
        window.print();
        $('#printModal').modal('show');
        setTimeout(function () {
            $('#printModal').modal('hide');
        }, 8000);
        return true;

    }

    self.LiveConnectClick = function () {
        PlayClickSound();
        //self.SendReporting('MAP', 'BUTTONCLICK', 'Print', "");
        //window.print();
        return true;
    }

    self.SendReporting = function (screen, eventtype, specificdata, quicklink) {
        var id = self.ClientVM.clientID() + ":" + getParameterByName(window.location.href, "location");
        SaveReportingInfo(id, screen, eventtype, specificdata, quicklink, self.CurrentLanguage());
    }

    self.ChangeLanguage = function () {
        PlayClickSound();
        $('#translateModal').modal('show');
        setTimeout(function () {
            if (self.CurrentLanguage() == 'english') {
                self.CurrentLanguage('spanish');
                self.LiveConnectAvailableForThisLanguage(false);
                $('#directionsSlideout').addClass('directionsSlideoutSpanish');
            }
            else if (self.CurrentLanguage() == 'spanish') {
                self.CurrentLanguage('english');
                if (self.KioskLiveConnect() != null && (self.KioskLiveConnect() == true)) self.LiveConnectAvailableForThisLanguage(self.KioskLiveConnect());
                self.LiveConnectAvailableForThisLanguage(true);
                $('#directionsSlideout').removeClass('directionsSlideoutSpanish');
            }
            setTimeout(function () {
                $('#translateModal').modal('hide');
                if (self.KioskAvatarGreeting()) {
                    $('#avatarGreetingVideoContainer').removeClass('avatarVideoLarge hide');
                    $('#avatarGreetingVideoContainer').addClass('avatarVideoLarge');
                    var videoFile = 'https://ljwbk.blob.core.windows.net/media/' + self.CurrentHost + '_greeting.mp4';
                    if (self.CurrentLanguage() == 'spanish') videoFile = 'https://ljwbk.blob.core.windows.net/media/' + self.CurrentHost + '_greeting_sp.mp4';
                    $('#avatarGreetingVideo source').attr('src', videoFile);
                    $('#avatarGreetingVideo')[0].load();
                    $('#avatarGreetingVideo')[0].play();
                }
            }, 5000);
        }, 1000);
    }
}