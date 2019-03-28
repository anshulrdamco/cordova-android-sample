var RESTSERVICESBASE = "https://ljrestservice.azurewebsites.net/";
//var RESTSERVICESBASE = "http://ljrestservicestaging.azurewebsites.net/";
//var RESTSERVICESBASE = "http://ljrestservice-dev.azurewebsites.net/";
var SVGBASELOCATION = "https://ljimageblob.blob.core.windows.net/wayfinder-blob/";
//var SVGBASELOCATION = "https://ljimageblob.blob.core.windows.net/wayfinder-blob-dev/";
//var SVGBASELOCATION = "https://ljimageblob.blob.core.windows.net/wayfinder-blob-stage/";
//var SVGBASELOCATION = "http://blob.yourdirectroute.com/wayfinder-blob-local/";
//var COMMONBLOB = "https://blob.yourdirectroute.com/wayfinder-common/";
var COMMONBLOB = "https://ljimageblob.blob.core.windows.net/wayfinder-common/";

if (RESTSERVICESBASE.toLowerCase().indexOf('ljrestservice-dev') > -1) {
    COMMONBLOB = "https://ljimageblob.blob.core.windows.net/wayfinder-blob-dev/wayfinder-common/";
}
else if (RESTSERVICESBASE.toLowerCase().indexOf('ljrestservicestaging') > -1) {
    COMMONBLOB = "https://ljimageblob.blob.core.windows.net/wayfinder-blob-stage/wayfinder-common/";
}
else {
    COMMONBLOB = "https://ljimageblob.blob.core.windows.net/wayfinder-blob/wayfinder-common/";
}
function MainViewModel() {
    var self = this;
    self.storageObject = {
        SessionID: 0
    };
    self.GetPortalParametersUrl = RESTSERVICESBASE + "api/v2/PortalParameter/";
    self.GetMenuDataUrl = RESTSERVICESBASE + "api/ClientMenuItem/";
    self.UpdateSessionURL = RESTSERVICESBASE + "api/UserTrackingInfo/";
    self.GetDataByNameUrl = RESTSERVICESBASE + "api/destination/";
    self.SendDirectionsUrl = RESTSERVICESBASE + "api/email/";
    self.clientVM = new ClientViewModel();
    self.eventsVM = new EventsViewModel();
    self.ljdirectionsVM = new LJDirectionsViewModel();
    self.toVM = new LocationViewModel("to");
    self.fromVM = new LocationViewModel("from");
    self.lookupVM = new LookupItemViewModel('main');
    self.lookupVM_selectedSubItem = ko.observable();
    self.dataVM = new DestinationListViewModel();
    self.currentPage = 'home';
    self.printableVM = new PrintableViewModel();
    self.isFooterNavBar = ko.observable(false);
    self.guideIsLink = ko.observable(false);
    self.googleDirectionsVM = new GoogleDirectionsViewModel();
    self.forceVisible = ko.observable(false);

    self.tagSearchModel = new TagSearchViewModel();

    self.EmailWarning = ko.computed(function () {
        var host = window.location.host;
        if (!host) host = "localhost.com";
        return "Note: Please add directions@" + host + " to your safe senders to ensure delivery.";
    });
    self.TestMode = ko.computed(function () {
        return window.location.host.indexOf('test') >= 0;
    });
    self.IsMobileWidth = function () {
        self.forceVisible();
        return $(window).width() < 480;
    }
    self.start_location = ko.observable({
        name: ''
    }).syncWith('newLocationfrom');
    self.end_location = ko.observable({
        name: ''
    }).syncWith('newLocationto');
    self.campus_visible = ko.observable(true).syncWith('campusVisible');
    self.searchStart_visible = ko.observable(true).syncWith('searchVisiblefrom');
    self.searchEnd_visible = ko.observable(true).syncWith('searchVisibleto');
    self.pushReverseDirections = function () {
        var host = getParameterByName(window.location.href, "host");
        self.ljdirectionsVM.resetPage();
        var url = "page="
        if ((mainVM.start_location().isGoogle) && mainVM.end_location().isOffCampus && !mainVM.end_location().isOffCampus()) {
            //Off Campus to On Campus
            url += "walkingdirections&";
            url += "from=" + encodeURIComponent(self.end_location().name()) + (host ? "&host=" + host : "") + "&addressto=" + encodeURIComponent(self.start_location().name()) + "&parking=" + self.toVM.selectedParking.LotID.substring(3)
        } else if ((mainVM.start_location().isOffCampus && !mainVM.start_location().isOffCampus()) && mainVM.end_location().isOffCampus && mainVM.end_location().isOffCampus()) {
            //On Campus to Off Campus
            url += "driving&";
            url += "address=" + encodeURIComponent(self.end_location().QuickLink()) + (host ? "&host=" + host : "") + "&to=" + encodeURIComponent(self.start_location().name()) + "&parking=" + self.toVM.selectedParking.ID;
        } else if (mainVM.start_location().isOffCampus && mainVM.start_location().isOffCampus() && mainVM.end_location().isOffCampus && mainVM.end_location().isOffCampus()) {
            //Off Campus to Off Campus
            url += "driving&";
            url += "address=" + encodeURIComponent(self.end_location().QuickLink()) + (host ? "&host=" + host : "") + "&addressto=" + encodeURIComponent(self.start_location().name());
        } else {
            //On Campus to On Campus
            if (self.start_location().isOffCampus()) url += "driving&";
            if (!self.start_location().isOffCampus()) url += "walkingdirections&";
            url += "from=" + encodeURIComponent(self.end_location().name()) + (host ? "&host=" + host : "") + "&to=" + encodeURIComponent(self.start_location().name());
            if (mainVM.start_location().isOffCampus && mainVM.start_location().isOffCampus()) {
                url += "&parking=" + self.toVM.selectedParking.LotID.substring(3);
            }
        }
        self.currentPage = "";
        self.toVM.parkingTypes.removeAll();
        self.toVM.selectedParking = null;
        var funcwithdelay = $.delayInvoke(function (event) {
            PushNewState(url);
        }, 50);
        funcwithdelay();
        //window.location.reload();
    }
    self.pushNextDestination = function () {
        //PushNewState('page=home&from=' + self.end_location().name());
        var url = window.location.href.split('?')[0].split('#')[0];
        var host = getParameterByName(window.location.href, "host");
        if (self.end_location().isOffCampus()) {
            window.location.href = "index.html#home?address=" + encodeURIComponent(self.end_location().QuickLink()) + (host ? "&host=" + host : "");
        } else {
            window.location.href = "index.html#home?from=" + encodeURIComponent(self.end_location().name()) + (host ? "&host=" + host : "");
        }
        $('#searchFieldFrom').val('');
        $("#searchFieldGoogle").val('');
        $('#searchFieldTo').val('');
        self.toVM.parkingTypes.removeAll();
        self.toVM.selectedParking = null;
        self.ljdirectionsVM.resetPage();
        //self.toVM.searchVM.results_visible(false);
    };
    self.emailLegendHtml = ko.observable('Who do you want to email?');
    self.emailToSendTo = ko.observable('');
    self.emailToSendTo.subscribe(function () {
        if (self.end_location() && self.start_location() && self.end_location().DisplayName && self.start_location().DisplayName
           && self.emailToSendTo().match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
            $('.mailToStatementButton').addClass("getDirectionsButton");
        }
        else {
            $('.mailToStatementButton').removeClass("getDirectionsButton");
        }
    });
    self.mailToStatement = function (data, server) {
        if (self.end_location() && self.start_location() && self.end_location().DisplayName && self.start_location().DisplayName
            && self.emailToSendTo().match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {

            var printing;
            if ((mainVM.start_location().isOffCampus && !mainVM.start_location().isOffCampus())) {
                printing = 3;
            } else {
                printing = 15;
            }

            if (!server) {
                var emailHref = ('mailto:' + encodeURIComponent(self.emailToSendTo())
                        + '?subject=' + encodeURIComponent('Directions to ' + self.end_location().DisplayName())
                        + '&body=' + encodeURIComponent('From: \r\n\t' + self.start_location().DisplayName() + ' \r\n'
                                                        + 'To: \r\n\t' + self.end_location().DisplayName() + ' \r\n'
                                                        + ' \r\n'
                                                        + 'Interactive Directions: \r\n\t' + location.href.replace('my location', 'my%20location') + ' \r\n'
                                                        + 'Printer Friendly Directions: \r\n\t' + location.href.replace('my location', 'my%20location').replace(/\#.+\?/, '#printable?printing=' + printing + '&') + ' \r\n'
                                                       ));
                mainVM.storageObject.isEmailed = true;
                document.location.href = emailHref;
            } else {

                var start_location_name = !mainVM.start_location() ? null : typeof mainVM.start_location().name == 'function' ? mainVM.start_location().name() : mainVM.start_location().name;
                var fromReference = mainVM.start_location().isOffCampus() ? 'address' : 'from';
                var toReference = mainVM.end_location().isOffCampus() ? 'addressto' : 'to';
                var end_location_name = !mainVM.end_location() ? null : typeof mainVM.end_location().name == 'function' ? mainVM.end_location().name() : mainVM.end_location().name;
                var selectedParkingID = !mainVM.toVM ? null : typeof mainVM.toVM.selectedParkingID == 'function' ? mainVM.toVM.selectedParkingID() : mainVM.toVM.selectedParkingID;
                var url = mainVM.SendDirectionsUrl + '?email=' + self.emailToSendTo() + '&host=' + (window.location.host ? window.location.host : "localhost:")
                    + '&endDisplayName=' + encodeURIComponent(self.end_location().DisplayName()) + '&startDisplayName=' + encodeURIComponent(self.start_location().DisplayName())
                    + '&parking=' + encodeURIComponent(selectedParkingID) + '&printing=' + printing + '&from=' + encodeURIComponent(start_location_name) + '&to=' + encodeURIComponent(end_location_name)
					 + '&fromref=' + encodeURIComponent(fromReference) + '&toref=' + encodeURIComponent(toReference);
                $.ajax({
                    url: url,
                    type: "GET",
                    dataType: getJsonDataType(),
                    contentType: getJsonContentType()
                });
                mainVM.storageObject.isEmailed = true;
            }
            if (mainVM.storageObject.SessionID) UpdateSession(mainVM.storageObject.SessionID, mainVM.storageObject.isPrinted, mainVM.storageObject.isEmailed);

            self.emailToSendTo('');
            $('#emailpopup' + data).popup('close');

            return false;
        }
        else
            ShowPopupWarningSpan();
        return false;
    };
    self.guideText = ko.observable();
    self.lookup_breadcrumb = new Array();
    self.directionsHref = ko.observable('#walkingdirections');
    self.MenuItems = new Array();
    self.driveMap = true;
    self.DirectionBtnEnabled = ko.observable(false);
    self.resetPage = function () {
        //We are not keeping session now so this is cleaner / solves Card #178: iPhone 5 bug: from the directions screen clicking start over causes issue with the main home screen.
        self.tagSearchModel.getAllDestinationData(self.clientVM.clientID());
        $('#searchFieldFrom').val('');
        $("#searchFieldGoogle").val('');
        $('#searchFieldTo').val('');
        self.printableVM.setPrinting(15);
        self.toVM.parkingTypes.removeAll();
        self.toVM.selectedParking = null;
        self.ljdirectionsVM.resetPage();
        var host = getParameterByName(window.location.href, "host");
        window.location.href = 'index.html' + (host ? "#home?host=" + host : "");
        return;

        //self.cleanData(); //clear out lookup data (prevent ghosts)
        //PushNewState("CLEAR");
        //self.fromVM.onoff('');
        //self.printableVM.setPrinting(0);
        //self.fromVM.searchVM.results_visible(false);
        //self.toVM.searchVM.results_visible(false);
        //self.storageObject = { SessionID: 0 };
        //self.toVM.parkingTypes.removeAll();
        //self.toVM.selectedParkingID(0);
        //self.toVM.selectedParking = null;
        //self.toVM.lastQL = '';
        //self.ljdirectionsVM.resetPage();
        //getViewState();
        //$('#searchFieldFrom').blur();
        //self.storageObject.loadTime = new Date().getTime();
    }

    self.printActionClick = function (data) {
        $('#actionMenu' + data).popup('close');
        var funcwithdelay = $.delayInvoke(function (event) {
            $('#printpopup' + data).popup('open');
        }, 50);
        funcwithdelay();
        return false;
    }

    self.sendEmailClick = function (data) {
        self.emailLegendHtml('Who do you want to email?');
        $('#actionMenu' + data).popup('close');
        var funcwithdelay = $.delayInvoke(function (event) {
            $('#emailpopup' + data).popup('open');
        }, 50);
        funcwithdelay();
        return false;
    }

    self.isMobile = {
        Android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function () {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };
    self.changeLocationFrom = function () {
        self.fromVM.searchVM.saved_value(self.start_location());
        self.fromVM.searchVM.saved_name('');
        self.fromVM.onoff('');
        $('#searchFieldFrom').val('');
        $("#searchFieldGoogle").val('');
        $("#searchFieldGoogleIE8").val('');
        self.searchStart_visible(true);
        self.campus_visible(true);
        $('#searchFieldFrom').blur();
        recreateBindings();
        PushNewState('', true);
    };
    self.changeLocationTo = function () {
        var dvm = new DestinationViewModel();
        dvm.name = "";
        self.toVM.searchVM.saved_value(dvm);
        self.toVM.searchVM.saved_name('');
        self.searchEnd_visible(true);
        $('#searchFieldTo').val('');
        $('#searchFieldTo').focus();
        recreateBindings();
        PushNewState('', false, true);
    };
    /*self.lookupVM_selectedSubItem.subscribe(function(newValue){
	});*/
    //self.dataVM.data_array2.subscribe(function () {
    //    var funcwithdelay = $.delayInvoke(function (event) {
    //        //$("#destinationList").trigger('refresh');
    //        //$("#destinationList").enhanceWithin();
    //        if ($("#destinationList").hasClass('ui-listview')) {
    //            $("#destinationList").listview("refresh");
    //        }
    //    }, 50);
    //    funcwithdelay();
    //});
    self.DirectionBtnEnabled.subscribe(function () {
        self.updateGuideInformation();
    });
    self.campus_visible.subscribe(function () {
        self.updateLinkVisibility();
    });
    self.searchStart_visible.subscribe(function () {
        self.updateLinkVisibility();
    });
    self.searchEnd_visible.subscribe(function () {
        self.updateLinkVisibility();
    });
    self.scrollToLast = null;
    self.scrollTo = function (id) {
        if (self.scrollToLast != id) {
            self.scrollToLast = id;
            $('html, body').animate({
                scrollTop: $(id).offset().top - 30
            }, 500);
        }
    }
    self.updateGuideInformation = function () {
        $('.Step1').show();
        $('.Step2').show();
        $('.Step3').show();
        self.guideIsLink(false);
        $("#searchFieldFrom").prop('disabled', false);
        $("#fromLookupButton").prop('disabled', false);
        if (!$("#searchStart div").hasClass('ui-state-disabled')) $("#searchStart div").addClass('ui-state-disabled');
        if (!self.searchStart_visible() && !self.searchEnd_visible()) {
            if (self.DirectionBtnEnabled()) {
                self.guideText("Your directions are ready!");
                self.guideIsLink(true);
            }
            if (!self.DirectionBtnEnabled()) self.guideText("Getting Directions...");
            if (self.IsMobileWidth()) {
                $('.Step1').hide();
                $('.Step2').show();
                $('.Step3').show();
            }
        } else if (self.searchStart_visible() && !self.campus_visible()) {
            self.guideText("Enter your current location.");
            //if (self.IsMobileWidth() && self.fromVM.onoff() != 'off') $('#searchFieldFrom').focus();
            //if (self.IsMobileWidth() && self.fromVM.onoff() != 'on') $('#searchFieldGoogle').focus();
            if (self.IsMobileWidth()) {
                $('.Step1').hide();
                $('.Step2').show();
                $('.Step3').hide();
            }
            if ($("#searchStart div").hasClass('ui-state-disabled')) $("#searchStart div").removeClass('ui-state-disabled');
            //if (self.fromVM.onCampusVisible()) self.scrollTo('#autocompleteFrom');
            //if (self.IsMobileWidth())
            //if (self.fromVM.offCampusVisible()) self.scrollTo('#autocompleteGoogle');
        } else if (self.searchStart_visible() && self.campus_visible()) {
            if (self.IsMobileWidth()) {
                $('.Step1').show();
                $('.Step2').hide();
                $('.Step3').hide();
            }
            self.guideText("Are you at " + self.clientVM.MainHeaderText() + "?");
            $("#searchFieldFrom").prop('disabled', true);
            $("#fromLookupButton").prop('disabled', true);
        } else if (!self.searchStart_visible() && self.searchEnd_visible()) {
            self.guideText("Enter your destination.");
            //if (self.IsMobileWidth()) $('#searchFieldTo').focus();
            if (self.IsMobileWidth()) {
                $('.Step1').hide();
                $('.Step2').hide();
                $('.Step3').show();
            }
        }
    }
    self.updateDirectionsButton = function () {
        if (!$("#directionsBtn").hasClass('pageButton')) $("#directionsBtn").addClass('pageButton');
        if ($("#directionsBtn").hasClass('dialogButton')) $("#directionsBtn").removeClass('dialogButton');
        if (!$("#directionsLink").hasClass('pageButton')) $("#directionsLink").addClass('pageButton');
        if ($("#directionsLink").hasClass('dialogButton')) $("#directionsLink").removeClass('dialogButton');
        if ((self.start_location().isOffCampus && !self.start_location().isOffCampus()) && (self.end_location().isOffCampus && !self.end_location().isOffCampus())) {
            self.directionsHref('#walkingdirections');
            self.DirectionBtnEnabled(true);
        } else if (((self.start_location().isOffCampus && !self.start_location().isOffCampus()) && (self.end_location().isOffCampus && self.end_location().isOffCampus())) ||
			((self.start_location().isOffCampus && self.start_location().isOffCampus()) && (self.end_location().isOffCampus && !self.end_location().isOffCampus()))) {
            self.DirectionBtnEnabled(false);
            $.when(self.toVM.PopulateParking(self.clientVM.clientID(), (self.end_location().isOffCampus() ? "ALL" : self.end_location().QuickLink()))).then(function () {
                if (self.toVM.parkingTypes().length > 1) {
                    if ($("#directionsBtn").hasClass('pageButton')) $("#directionsBtn").removeClass('pageButton');
                    if (!$("#directionsBtn").hasClass('dialogButton')) $("#directionsBtn").addClass('dialogButton');
                    if ($("#directionsLink").hasClass('pageButton')) $("#directionsLink").removeClass('pageButton');
                    if (!$("#directionsLink").hasClass('dialogButton')) $("#directionsLink").addClass('dialogButton');
                    self.directionsHref('#popupPrompt');
                } else {
                    self.directionsHref('#driving');
                }
                self.DirectionBtnEnabled(true);
            });
        } else if ((self.start_location().isOffCampus && self.start_location().isOffCampus()) || (self.end_location().isOffCampus && self.end_location().isOffCampus())) {
            self.directionsHref('#driving');
            self.DirectionBtnEnabled(true);
        }
        try {
            var startCampus = mainVM.start_location().QuickLink().split("-")[1];
            var endCampus = mainVM.end_location().QuickLink().split("-")[1];
            if (startCampus == null) startCampus = "";
            if (endCampus == null) endCampus = "";
            if (startCampus.trim() != endCampus.trim()) {
                if ($("#directionsBtn").hasClass('pageButton')) $("#directionsBtn").removeClass('pageButton');
                if (!$("#directionsBtn").hasClass('dialogButton')) $("#directionsBtn").addClass('dialogButton');
                if ($("#directionsLink").hasClass('pageButton')) $("#directionsLink").removeClass('pageButton');
                if (!$("#directionsLink").hasClass('dialogButton')) $("#directionsLink").addClass('dialogButton');
                self.directionsHref('#campusPopupPrompt');
                var addr = mainVM.clientVM.campusAddress(startCampus ? startCampus : 0);
                mainVM.clientVM.CampusMessage("The destination you selected is not within walking distance. The directions provided are starting from this nearby address " + addr);
            }
        } catch (e) { }
    }
    self.updateLinkVisibility = function () {
        self.updateGuideInformation();
        self.updateDirectionsButton();
    }
    self.itemClicked = function (item) {
        if (jQuery.inArray(item, self.lookup_breadcrumb) < 0) self.lookup_breadcrumb.push(self.lookupVM_selectedSubItem());
        if (item.lookupItemType == 7) {
            PushNewState('page=eventspage');
            return;
        }
        if (item.hasSubItems()) {
            self.lookupVM_selectedSubItem(item);
            $('#lookup').enhanceWithin();
            PushNewState('page=lookup');
        } else {
            PushNewState('page=data');
            self.dataVM.headerText(item.headerText);
            self.dataVM.StartIndex(0);
            self.dataVM.Filter('');
            self.dataVM.Sorting('');
            self.dataVM.ClientDestinationID(item.data_id);

        }
    };
    self.backClick = function (data, event) {
        if (!event.performedBackClick) {
            event.performedBackClick = true; //Prevent multi call
            var activePage = $("body").pagecontainer("getActivePage");
            var funcwithdelay = $.delayInvoke(function () {
                if (self.lookup_breadcrumb.length > 0) {
                    self.lookupVM_selectedSubItem(self.lookup_breadcrumb.pop());
                    $('#lookup').enhanceWithin();
                    if (activePage.data('url') == 'data') {
                        self.cleanData();
                    }
                    if (activePage[0].id != 'lookup') {
                        PushNewState('page=lookup');
                    }
                } else {
                    PushNewState('page=home');
                }
            }, 10);
            funcwithdelay();
        }
    };


    self.cleanData = function () {

        //$('#destination-list-div').html('');
        //self.dataVM.data_array2.removeAll();
        //self.dataVM.data_columns_array.removeAll();
        //if ($.mobile.activePage && $.mobile.activePage.data('url') == 'data') {
        //    ko.applyBindings(mainVM, document.getElementById("data"));
        //}
    }
    self.SetFromViaUrl = function (url) {
        var deferred = $.Deferred();

        var fromID = getParameterByName(url, 'from');
        if (fromID && fromID != 'undef' && (!self.start_location().name || fromID.toLowerCase() != self.start_location().name().toLowerCase())) {
            $.support.cors = true;
            $.ajax({
                url: self.GetDataByNameUrl + "?id=" + encodeURIComponent(fromID.replace('#', '%23')) + '&ClientID=' + self.clientVM.clientID() + getJsonpSuffix(),
                type: "GET",
                dataType: getJsonDataType(),
                contentType: getJsonContentType(),
                success: function (jsonObject) {
                    var dvm = new DestinationViewModel([]);
                    dvm.name(jsonObject.UniqueName);
                    dvm.DisplayName(jsonObject.DisplayName);
                    dvm.QuickLink(jsonObject.QuickLink);
                    self.start_location(dvm);
                    self.campus_visible(false);
                    self.searchStart_visible(false);
                    self.fromVM.onoff('on');
                    if (!mainVM.storageObject['fromSearchType']) mainVM.storageObject['fromSearchType'] = 'prepop';
                    self.storageObject['StartDestinationName'] = self.start_location().name();
                    deferred.resolve();
                    //mainVM.lookupVM.mainHeaderText('PlaceHolder');

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    throw 'getJSON failed: ' + errorThrown + ' ' + self.GetDataByNameUrl + '?DestinationName=' + encodeURIComponent(fromID.replace('#', '%23')) + '&ClientID=' + self.clientVM.clientID() + getJsonpSuffix();
                }
            });
        } else if (!fromID && fromID != 'undef' && !getParameterByName(url, 'address')) {
            self.campus_visible(true);
            self.searchStart_visible(true);
            self.fromVM.onoff('');
            self.fromVM.searchVM.saved_name('');
            self.storageObject['StartDestinationName'] = '';
            //self.start_location(new DestinationViewModel([]));
            deferred.resolve();
        } else if (fromID != 'undef' && self.start_location() && self.start_location().name) {
            self.campus_visible(false);
            self.searchStart_visible(false);
            self.storageObject['StartDestinationName'] = self.start_location().name();
            deferred.resolve();
        } else if (fromID == 'undef' && !getParameterByName(url, 'address')) {
            self.searchStart_visible(true);
            self.start_location({
                name: ''
            });
            self.fromVM.onoff('on');
            self.fromVM.searchVM.saved_name('');
            self.storageObject['StartDestinationName'] = '';
        } else {
            deferred.resolve();
        }
        return deferred.promise();
    }
    self.SetToViaUrl = function (url) {
        var deferred = $.Deferred();

        var toID = getParameterByName(url, 'to');
        if (toID && (!self.end_location().name || toID.toLowerCase() != self.end_location().name().toLowerCase())) {
            $.support.cors = true;
            $.ajax({
                url: self.GetDataByNameUrl + "?id=" + encodeURIComponent(toID.replace('#', '%23')) + '&ClientID=' + self.clientVM.clientID() + getJsonpSuffix(),
                type: "GET",
                dataType: getJsonDataType(),
                contentType: getJsonContentType(),
                success: function (jsonObject) {
                    var dvm = new DestinationViewModel([]);
                    dvm.name(jsonObject.UniqueName);
                    dvm.DisplayName(jsonObject.DisplayName);
                    dvm.QuickLink(jsonObject.QuickLink);
                    self.end_location(dvm);
                    self.searchEnd_visible(false);
                    if (!mainVM.storageObject['toSearchType']) mainVM.storageObject['toSearchType'] = 'prepop';
                    self.storageObject['EndDestinationName'] = dvm.name();
                    deferred.resolve();
                    //mainVM.lookupVM.mainHeaderText('PlaceHolder');

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    throw 'getJSON failed: ' + errorThrown + ' ' + self.GetDataByNameUrl + '?DestinationName=' + encodeURIComponent(toID.replace('#', '%23')) + '&ClientID=' + self.clientVM.clientID() + getJsonpSuffix();
                }
            });
        } else if (!toID) {
            var addressID = getParameterByName(url, 'addressto');
            if (addressID) {
                $.when(self.toVM.googleVM.GetDestinationLocation(addressID)).then(function () {
                    deferred.resolve();
                });
            } else {
                self.searchEnd_visible(true);
                self.toVM.searchVM.saved_name('');
                self.storageObject['EndDestinationName'] = '';
                //self.end_location(new DestinationViewModel([]));
                deferred.resolve();
            }
        } else if (self.end_location().name) {
            self.searchEnd_visible(false);
            self.storageObject['EndDestinationName'] = self.end_location().name();
            deferred.resolve();
        } else {
            deferred.resolve();
        }
        return deferred.promise();
    }

}

function escapeJSON(jsonString) {
    // This only replaces new lines. Add more escapes here
    return jsonString.replace(/\r?\n/g, "");
}

function getImageDataURL(url, success, error) {
    var data, canvas, ctx;
    var img = new Image();
    img.onload = function () {
        // Create the canvas element.
        canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        // Get '2d' context and draw the image.
        ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        // Get canvas data URL
        try {
            data = canvas.toDataURL();
            success({
                image: img,
                data: data
            });
        } catch (e) {
            error(e);
        }
    }
    // Load image URL.
    try {
        img.src = url;
    } catch (e) {
        error(e);
    }
}

function PushNewState(newParameter, clearFrom, clearTo, obj, title) {
    var NewURL = getNewURL(newParameter, clearFrom, clearTo);
    if (window.location.hash != NewURL) {
        $.mobile.navigate(NewURL, (obj ? obj : null));
    }
}

function getNewURL(queryString, clearFrom, clearTo) {
    var newQueryString = queryString.toLowerCase();
    var removeFrom = false;
    var removeAddress = false;
    var removeTo = false;
    if (newQueryString.indexOf('from=') > -1) removeAddress = true;
    if (newQueryString.indexOf('address=') > -1) removeFrom = true;
    if (clearFrom) {
        removeFrom = true;
        removeAddress = true;
    }
    if (clearTo) removeTo = true;

    var url = window.location.href.split(/[\\?#]+/)[0];
    if (queryString == "CLEAR") return url.replace('#', '');
    var hash = window.location.href.split(/[\\?#]+/)[window.location.href.split(/[\\?#]+/).length - 1].split('#')[1];
    if (window.location.href.split(/[\\?#]+/)[1]) {

        var params = window.location.href.split(/[\\?#&]+/);
        for (var i = 0; i < params.length; i++) {
            if (newQueryString.indexOf(params[i].split('=')[0].toLowerCase() + '=') < 0) {
                if (params[i].split('=')[0].toLowerCase() == '_suid') continue;
                if (removeAddress && params[i].split('=')[0].toLowerCase() == 'address') continue;
                if (removeFrom && params[i].split('=')[0].toLowerCase() == 'from') continue;
                if (removeTo && params[i].split('=')[0].toLowerCase() == 'to') continue;
                if (params[i].split('=')[1]) {
                    if (newQueryString.length > 0) newQueryString += '&';
                    newQueryString += params[i].split('=')[0] + '=' + params[i].split('=')[1];
                }
            }
        }
    }

    if (newQueryString.indexOf('page=') == 0) {
        newQueryString = "#" + newQueryString.substring('page='.length).replace('&', '?'); //replace first & with ?
        //mainVM.currentPage = newQueryString.substring(1, newQueryString.indexOf('?'));
    } else if (newQueryString.indexOf('&page=') > 0) {
        var first = newQueryString.split('&page=')[0];
        var second = newQueryString.split('&page=')[1];
        var page = "";
        if (second.indexOf('&') > -1) {
            page = second.split('&')[0];
            second = second.substring(page.length);
        } else {
            page = second;
            second = ""
        }
        newQueryString = "#" + (page || 'home') + "?" + first + second;
        //mainVM.currentPage = page;
    } else if (window.location.href.match(/#([^=]+)[\\?]/)) {
        page = window.location.href.match(/#([^=]+)[\\?]/)[1];
        newQueryString = "#" + page + "?" + newQueryString;
        //mainVM.currentPage = page;
    } else
        newQueryString = '#home?' + newQueryString;

    newQueryString = newQueryString.replace(/#$/, '')

    var start_location_name = !mainVM.start_location() ? null : typeof mainVM.start_location().name == 'function' ? mainVM.start_location().name() : mainVM.start_location().name;
    var end_location_name = !mainVM.end_location() ? null : typeof mainVM.end_location().name == 'function' ? mainVM.end_location().name() : mainVM.end_location().name;
    var selectedParkingID = !mainVM.toVM ? null : typeof mainVM.toVM.selectedParkingID == 'function' ? mainVM.toVM.selectedParkingID() : mainVM.toVM.selectedParkingID;

    if (newQueryString != "#home" && newQueryString.indexOf("?") == -1
        && (
            (start_location_name)
            || (end_location_name)
            || (selectedParkingID)
           )
        ) {
        if (selectedParkingID && newQueryString.indexOf("parking=") == -1) {
            newQueryString += (newQueryString.indexOf("?") == -1 ? "?" : "&") + "parking=" + encodeURIComponent(selectedParkingID);
        }
        if (start_location_name && newQueryString.indexOf("from=") == -1) {
            newQueryString += (newQueryString.indexOf("?") == -1 ? "?" : "&") + "from=" + encodeURIComponent(start_location_name);
        }
        if (end_location_name && newQueryString.indexOf("to=") == -1) {
            newQueryString += (newQueryString.indexOf("?") == -1 ? "?" : "&") + "to=" + encodeURIComponent(end_location_name);
        }
    }
    return newQueryString //url.replace('#', '');
}

function recreateBindings() {

    //initializeGoogle();
}

var mainVM = new MainViewModel();
//var History = window.History;
var SUPPORTS_SVG = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");

function getParameterByName(url, name) {
    var regexS = "";
    if (name == 'page' && url.indexOf('page=') == -1) { //page can be the first variable name instead of page=pageName
        regexS = "[\\?#]([^\\?&#]*)";
    } else {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        regexS = "[\\?&#]" + name + "=([^&#]*)";
    }
    var regex = new RegExp(regexS);
    var results = regex.exec(url.toLowerCase());

    if (results == null || (name == 'page' && results[1].indexOf('=') > -1))
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}

$(window).resize(function () {
    //resize just happened, pixels changed
    mainVM.clientVM.setLogoImage();
    setNavBar();
    mainVM.ljdirectionsVM.resizeSVG();
    mainVM.updateGuideInformation();
    mainVM.forceVisible(!mainVM.forceVisible());
    $('.actionButton').toggleClass('ui-btn-icon-notext', mainVM.IsMobileWidth());
    $('.actionButton').toggleClass('ui-btn-icon-left', !mainVM.IsMobileWidth());
    resizeGoogleMaps();
});

function setNavBar() {
    if (mainVM.IsMobileWidth()) {
        mainVM.isFooterNavBar(true);
    } else {
        mainVM.isFooterNavBar(false);
    }
}

function resizeGoogleMaps() {
    if (mainVM.googleDirectionsVM.map !== null) {
        google.maps.event.addListenerOnce(mainVM.googleDirectionsVM.map, 'resize', function () {
            // listens for the resize event and centers the map based on the bounds
            if (mainVM.googleDirectionsVM.googleMapBounds) {
                mainVM.googleDirectionsVM.map.setCenter(mainVM.googleDirectionsVM.googleMapBounds.getCenter());
                mainVM.googleDirectionsVM.map.fitBounds(mainVM.googleDirectionsVM.googleMapBounds);
            }
        });

        // resizes and refreshes the map whenever we switch to the google map page
        var funcwithdelay = $.delayInvoke(function (event) {
            google.maps.event.trigger(mainVM.googleDirectionsVM.map, 'resize');
        }, 50);
        funcwithdelay();
    }
}

window.onload = function () {
    if (!mainVM) mainVM = new MainViewModel();
    mainVM.cleanData();

    if (mainVM.TestMode()) {
        alert('You are in test mode. Statistics will not be reported.  Click OK to continue.');
    }

    checkRefresh();
    if (!mainVM.storageObject.loadTime) { mainVM.storageObject.loadTime = new Date().getTime(); }
    //History = window.History;
    //initializeGoogle();
    mainVM.googleDirectionsVM.initializeGoogleMap(mainVM.clientVM.mainLatLng, mainVM.clientVM.mainLatLng);
    ko.applyBindings(mainVM, document.getElementById("mainBody"));
    //mainVM.clientVM.clientID('4');
    mainVM.clientVM.LoadPortalParameters(function () {
        mainVM.tagSearchModel.getAllDestinationData(mainVM.clientVM.clientID());
        mainVM.clientVM.setLogoImage();

        setNavBar();

        PopulateLookup();

        getViewState();
        $('.actionButton').toggleClass('ui-btn-icon-notext', mainVM.IsMobileWidth());
        $('.actionButton').toggleClass('ui-btn-icon-left', !mainVM.IsMobileWidth());
        $('#monthSelector').val(mainVM.eventsVM.currentMonth());
        $('#daySelector').val(mainVM.eventsVM.currentDay());
        $('#yearSelector').val(mainVM.eventsVM.currentYear());
        $('#monthSelector').selectmenu();
        $('#daySelector').selectmenu();
        $('#yearSelector').selectmenu();
        $('#monthSelector').selectmenu("refresh", true);
        $('#daySelector').selectmenu("refresh", true);
        $('#yearSelector').selectmenu("refresh", true);
        initialized = true;
    });
}
var initialized = false;
var loadingDirections = false;
function getViewState(newHash) {
    var activePage = $("body").pagecontainer("getActivePage");
    var pageID = newHash ? newHash : getParameterByName(window.location.href, 'page');
    if (!pageID && activePage && activePage.length > 0)
        pageID = activePage[0].id;
    if (!pageID)
        pageID = 'home';
    if (pageID == "eventspage") {
        mainVM.eventsVM.PopulateEvents();
    }
    if (mainVM.currentPage != pageID) {
        mainVM.currentPage = pageID;
        //PushNewState('page=' + pageID);
        PushNewState('page=' + pageID);
        recreateBindings();
        mainVM.searchStart_visible(true);
        mainVM.searchEnd_visible(true);
        if (pageID === "driving" ||
			pageID === "drivingdirections" ||
			pageID === "walking" ||
			pageID === "walkingdirections" ||
			pageID === "home" ||
			pageID === "printable") {

            mainVM.clientVM.setLogoImage();
            $.when(
				mainVM.fromVM.googleVM.GetLocationViaUrl(window.location.href),
				mainVM.SetFromViaUrl(window.location.href),
				mainVM.SetToViaUrl(window.location.href)
				//mainVM.fromVM.setParkingViaURL(window.location.href)
			).then(function (result, result2, result3) {
                if (mainVM.end_location().QuickLink && mainVM.start_location().QuickLink && (!mainVM.end_location().QuickLink() || !mainVM.start_location().QuickLink()) ) {
			        alert('Cannot get directions to this location, please try another.');
			        window.location.href = '/index.html';
			        return false;
			    }
			    mainVM.updateLinkVisibility();
			    if (pageID === "driving" ||
					pageID === "drivingdirections" ||
					pageID === "walking" ||
					pageID === "walkingdirections" ||
					pageID === "printable") {
			        if (mainVM.searchStart_visible() === false && mainVM.searchEnd_visible() === false) {
			            if ($('div.loadingCover').hasClass('hide'))
			                $('div.loadingCover').removeClass('hide');
			            DrawDirections();
			        } else {
			            PushNewState('page=home');
			        }
			        var printing = parseInt(getParameterByName(window.location.href, 'printing'));
			        if (printing) mainVM.printableVM.setPrinting(printing);
			        mainVM.clientVM.refreshTabs();
			    }
			});
        }
    } else if (pageID == 'home') {
        $.when(
			mainVM.fromVM.googleVM.GetLocationViaUrl(window.location.href),
			mainVM.SetFromViaUrl(window.location.href),
			mainVM.SetToViaUrl(window.location.href)
			//mainVM.fromVM.setParkingViaURL(window.location.href)
		).then(function (result, result2, result3, result4) {
		    mainVM.updateLinkVisibility();
		    $('div.loadingCover').addClass('hide'); // hides the loading cover
		});
    } else if (pageID == 'driving') {
        resizeGoogleMaps();
        $('div.loadingCover').addClass('hide');
    } else if (!loadingDirections) {
        $('div.loadingCover').addClass('hide');
    }
}
var lastStartName = "";
var lastEndName = "";
var ignoreSkip = false;
function DrawDirections() {
    if (!ignoreSkip && mainVM.start_location().name() == lastStartName && mainVM.end_location().name() == lastEndName) {
        $('div.loadingCover').addClass('hide');
        return;
    }
    loadingDirections = true;
    if (ignoreSkip) ignoreSkip = false;
    lastStartName = mainVM.start_location().name();
    lastEndName = mainVM.end_location().name();
    var mapVersion = getParameterByName(window.location.href, 'mv');
    if ((mainVM.start_location().isOffCampus && mainVM.start_location().isOffCampus()) && mainVM.end_location().isOffCampus && !mainVM.end_location().isOffCampus()) {
        var parkingID = getParameterByName(window.location.href, 'parking');
        if (!parkingID || parkingID == "undefined") parkingID = 1;
        if (parkingID) {
            $.when(mainVM.toVM.GetSelectedParking(mainVM.clientVM.clientID(), parkingID, mainVM.end_location())).then(function (result) {
                if (!mainVM.toVM.selectedParking) mainVM.toVM.ForceParking();
                if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false) {
                    mainVM.googleDirectionsVM.urlBase = "https://maps.apple.com/maps?saddr=[START LOCATION]&daddr=[END LOCATION]";
                    if (mainVM.start_location().name().toLowerCase() == 'my location') {
                        mainVM.googleDirectionsVM.url(mainVM.googleDirectionsVM.urlBase.replace("[START LOCATION]", mainVM.start_location().QuickLink().lat() + "," + mainVM.start_location().QuickLink().lng()).replace("[END LOCATION]", mainVM.toVM.selectedParking.Latitude + "," + mainVM.toVM.selectedParking.Longitude));
                    } else {
                        mainVM.googleDirectionsVM.url(mainVM.googleDirectionsVM.urlBase.replace("[START LOCATION]", mainVM.start_location().name()).replace("[END LOCATION]", mainVM.toVM.selectedParking.Latitude + "," + mainVM.toVM.selectedParking.Longitude));
                    }
                } else {
                    mainVM.googleDirectionsVM.urlBase = "https://maps.google.com/maps?saddr=[START LOCATION]&daddr=[END LOCATION]";
                    mainVM.googleDirectionsVM.url(mainVM.googleDirectionsVM.urlBase.replace("[START LOCATION]", mainVM.start_location().name()).replace("[END LOCATION]", mainVM.toVM.selectedParking.Latitude + "," + mainVM.toVM.selectedParking.Longitude));
                }
                $.when(mainVM.googleDirectionsVM.getDirections(mainVM.start_location().QuickLink(), new google.maps.LatLng(mainVM.toVM.selectedParking.Latitude, mainVM.toVM.selectedParking.Longitude)))
					.then(function (result) {
					    var parkingID = mainVM.toVM.selectedParking ? mainVM.toVM.selectedParking.ID ? mainVM.toVM.selectedParking.ID : mainVM.toVM.selectedParking.LotID.substring(3) : 1;
					    //resizeGoogleMaps();
					    $.when(mainVM.ljdirectionsVM.UpdateLinkAndDirections(mainVM.clientVM.clientID(), 0, mainVM.end_location().QuickLink(), parkingID, mapVersion)
						).then(function () {
						    resizeGoogleMaps();
						    $('div.loadingCover').addClass('hide'); // hides the loading cover
						    loadingDirections = false;
						});
					}).fail(function () {
					    if (mainVM.googleDirectionsVM.errorMessage() == 'Error: ' + google.maps.DirectionsStatus.ZERO_RESULTS) {
					        alert('We could not find any driving route from this location.\nPlease use any near by location.');
					        window.location.href = '/index.html';
					        return;
					    }
					    else {
					        alert('failed getting directions');
					    }
					    loadingDirections = false;
					});
            }).fail(function () {
                PushNewState('page=home');
                loadingDirections = false;
            });
        } else {
            PushNewState('page=home');
            loadingDirections = false;
        }
    } else if ((mainVM.start_location().isOffCampus && !mainVM.start_location().isOffCampus()) && mainVM.end_location().isOffCampus && mainVM.end_location().isOffCampus()) {
        var parkingID = getParameterByName(window.location.href, 'parking');
        if (!parkingID) parkingID = 1;
        if (parkingID) {
            $.when(mainVM.toVM.GetSelectedParking(mainVM.clientVM.clientID(), parkingID, mainVM.end_location())).then(function (result) {
                if (!mainVM.toVM.selectedParking) mainVM.toVM.ForceParking();
                if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false) {
                    mainVM.googleDirectionsVM.urlBase = "https://maps.apple.com/maps?saddr=[START LOCATION]&daddr=[END LOCATION]";
                } else {
                    mainVM.googleDirectionsVM.urlBase = "https://maps.google.com/maps?saddr=[START LOCATION]&daddr=[END LOCATION]";
                }
                mainVM.googleDirectionsVM.url(mainVM.googleDirectionsVM.urlBase.replace("[END LOCATION]", mainVM.end_location().QuickLink()).replace("[START LOCATION]", mainVM.toVM.selectedParking.Latitude + "," + mainVM.toVM.selectedParking.Longitude));
                $.when(mainVM.googleDirectionsVM.getDirections(new google.maps.LatLng(mainVM.toVM.selectedParking.Latitude, mainVM.toVM.selectedParking.Longitude), mainVM.end_location().QuickLink()))
					.then(function (result) {
					    var parkingID = mainVM.toVM.selectedParking ? mainVM.toVM.selectedParking.LotID ? mainVM.toVM.selectedParking.LotID.substring(3) : mainVM.toVM.selectedParking.ID : 1;
					    //resizeGoogleMaps();
					    $.when(mainVM.ljdirectionsVM.UpdateLinkAndDirections(mainVM.clientVM.clientID(), mainVM.start_location().QuickLink(), 0, parkingID, mapVersion)
						).then(function () {
						    resizeGoogleMaps();
						    $('div.loadingCover').addClass('hide'); // hides the loading cover
						    loadingDirections = false;
						});
					}).fail(function () {
					    if (mainVM.googleDirectionsVM.errorMessage() == 'Error: ' + google.maps.DirectionsStatus.ZERO_RESULTS) {
					        alert('We could not find any driving route from this location.\nPlease use any near by location.');
					        window.location.href = '/index.html';
					        return;
					    }
					    else {
					        alert('failed getting directions');					        
					    }
					    loadingDirections = false;
					});
            }).fail(function () {
                PushNewState('page=home');
                loadingDirections = false;
            });
        } else {
            PushNewState('page=home');
            loadingDirections = false;
        }
    } else if (mainVM.start_location().isOffCampus && mainVM.start_location().isOffCampus() && mainVM.end_location().isOffCampus && mainVM.end_location().isOffCampus()) {
        if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false) {
            mainVM.googleDirectionsVM.urlBase = "https://maps.apple.com/maps?saddr=[START LOCATION]&daddr=[END LOCATION]";
            if (mainVM.start_location().name().toLowerCase() == 'my location') {
                mainVM.googleDirectionsVM.url(mainVM.googleDirectionsVM.urlBase.replace("[END LOCATION]", mainVM.end_location().QuickLink()).replace("[START LOCATION]", mainVM.start_location().QuickLink().lat() + "," + mainVM.start_location().QuickLink().lng()));
            } else {
                mainVM.googleDirectionsVM.url(mainVM.googleDirectionsVM.urlBase.replace("[END LOCATION]", mainVM.end_location().QuickLink()).replace("[START LOCATION]", mainVM.start_location().name()));
            }
        } else {
            mainVM.googleDirectionsVM.urlBase = "https://maps.google.com/maps?saddr=[START LOCATION]&daddr=[END LOCATION]";
            mainVM.googleDirectionsVM.url(mainVM.googleDirectionsVM.urlBase.replace("[END LOCATION]", mainVM.end_location().QuickLink()).replace("[START LOCATION]", mainVM.start_location().name()));
        }
        $.when(mainVM.googleDirectionsVM.getDirections(mainVM.start_location().QuickLink(), mainVM.end_location().QuickLink())).then(function (result) {
            resizeGoogleMaps();
            $('div.loadingCover').addClass('hide'); // hides the loading cover
            loadingDirections = false;
        });
    } else {
        var startCampus = mainVM.start_location().QuickLink().split("-")[1];
        var endCampus = mainVM.end_location().QuickLink().split("-")[1];
        if (startCampus == null) startCampus = "";
        if (endCampus == null) endCampus = "";
        if (startCampus.trim() == endCampus.trim()) {
            $.when(mainVM.ljdirectionsVM.UpdateLinkAndDirections(mainVM.clientVM.clientID(), mainVM.start_location().QuickLink(), mainVM.end_location().QuickLink(), 0, mapVersion)
			).then(function () {
			    $('div.loadingCover').addClass('hide'); // hides the loading cover
			    loadingDirections = false;
			});
        } else {
            var addr = mainVM.clientVM.campusAddress(startCampus.trim() ? startCampus.trim() : 0);
            //mainVM.start_location().name(addr);
            mainVM.start_location().QuickLink(addr);
            ignoreSkip = true;
            loadingDirections = false;
            DrawDirections();
        }
    }
}

/*window.addEventListener("popstate", function(e) {
	//mainVM.fromVM.PopulateParking()
	getViewState();
});*/

function PopulateLookup() {
    $.support.cors = true;
    $.ajax({
        url: mainVM.GetMenuDataUrl + '?ClientID=' + mainVM.clientVM.clientID() + getJsonpSuffix(),
        type: "GET",
        dataType: getJsonDataType(),
        contentType: getJsonContentType(),
        success: function (jsonObject) {
            if (Array.isArray(jsonObject)) {
                for (var i = 0; i < jsonObject.length; i++) {
                    var parent;
                    if (jsonObject[i].ParentID == "") {
                        parent = mainVM.lookupVM;
                    } else {
                        parent = FindParent(jsonObject[i].ParentID, mainVM.lookupVM);
                    }
                    var livm = new LookupItemViewModel(jsonObject[i].ActionID);
                    livm.headerText = jsonObject[i].MenuLabel.replace('&amp;', '&');
                    livm.data_id = jsonObject[i].OnClick;
                    livm.ID = jsonObject[i].ID;
                    if (parent != null)
                        parent.subItems.push(livm);
                }
            }
            mainVM.lookupVM.mainHeaderText('PlaceHolder');
        },
        error: function (jqXHR, textStatus, errorThrown) {
            throw 'getJSON failed: ' + errorThrown + ' ' + mainVM.GetMenuDataUrl + '?ClientID=' + mainVM.clientVM.clientID() + getJsonpSuffix();
        }
    });
}

function ResetLookup(location) {
    mainVM.lookup_breadcrumb = Array();
    mainVM.dataVM.lookup_reference = location;
    mainVM.lookupVM_selectedSubItem(mainVM.lookupVM);
    var funcwithdelay = $.delayInvoke(function (event) {
        $('#lookup').enhanceWithin();
    }, 100);
    funcwithdelay();
    if (location == "to")
        mainVM.lookupVM.mainHeaderText('Select Destination');
    else
        mainVM.lookupVM.mainHeaderText('');
}

function focusFrom() {
    var funcwithdelay = $.delayInvoke(function (event) {
        mainVM.fromVM.searchVM.PopulateSuggestions(mainVM.fromVM.searchVM.saved_name());
        mainVM.fromVM.searchVM.results_visible(true);
        //if(mainVM.fromVM.searchVM.saved_value() != null) mainVM.fromVM.searchVM.search_visible(false);
    }, 10);
    funcwithdelay();
}

function blurFrom(event) {
    if (cancelFromBlur) {
        cancelFromBlur = false;
    } else {
        var funcwithdelay = $.delayInvoke(function (event) {
            if (mainVM.fromVM.searchVM.saved_name() && (!mainVM.fromVM.searchVM.saved_value() || !mainVM.fromVM.searchVM.saved_value().name)) {
                mainVM.fromVM.searchVM.selectCurrentResult();
            }
            mainVM.fromVM.searchVM.results_visible(false);
            //if(mainVM.fromVM.searchVM.saved_value() != null) mainVM.fromVM.searchVM.search_visible(false);
        }, 0);
        funcwithdelay();
    }
}
var cancelFromBlur = false;
var cancelToBlur = false;
var cancelGoogleBlur = false;

//function MouseDownfromItem(event) {
//    cancelFromBlur = true;
//}

//function MouseDowntoItem(event) {
//    cancelToBlur = true;
//}

function focusTo() {
    var funcwithdelay = $.delayInvoke(function (event) {
        mainVM.toVM.searchVM.PopulateSuggestions(mainVM.toVM.searchVM.saved_name());
        mainVM.toVM.searchVM.results_visible(true);
        //if(mainVM.toVM.searchVM.saved_value() != null) mainVM.toVM.searchVM.search_visible(false);
    }, 0);
    funcwithdelay();
}

function blurTo() {
    if (cancelToBlur) {
        cancelToBlur = false;
    } else {
        var funcwithdelay = $.delayInvoke(function (event) {
            if (mainVM.toVM.searchVM.saved_name() && (!mainVM.toVM.searchVM.saved_value() || !mainVM.toVM.searchVM.saved_value().name)) {
                mainVM.toVM.searchVM.selectCurrentResult();
            }
            mainVM.toVM.searchVM.results_visible(false);
            //if(mainVM.toVM.searchVM.saved_value() != null) mainVM.toVM.searchVM.search_visible(false);
        }, 0);
        funcwithdelay();
    }
}

function focusGoogle() {
    var funcwithdelay = $.delayInvoke(function (event) {
        mainVM.fromVM.googleVM.results_visible(true);
        //if(mainVM.toVM.searchVM.saved_value() != null) mainVM.toVM.searchVM.search_visible(false);
    }, 0);
    funcwithdelay();
}

function blurGoogle() {
    if (cancelGoogleBlur) {
        cancelGoogleBlur = false;
    } else {
        var funcwithdelay = $.delayInvoke(function (event) {
            if (mainVM.toVM.searchVM.saved_name() && (!mainVM.toVM.searchVM.saved_value() || !mainVM.toVM.searchVM.saved_value().name)) {
                mainVM.fromVM.googleVM.changeSavedValue(mainVM.fromVM.googleVM.currentSelectedResult().toString());
            }
            mainVM.fromVM.googleVM.results_visible(false);
            //if(mainVM.toVM.searchVM.saved_value() != null) mainVM.toVM.searchVM.search_visible(false);
        }, 0);
        funcwithdelay();
    }
}

function toKeyUp(event) {
    if (event.keyCode == 13)
        mainVM.toVM.searchVM.selectCurrentResult();
    else if (event.keyCode == 40)
        mainVM.toVM.searchVM.increaseCurrentResult();
    else if (event.keyCode == 38)
        mainVM.toVM.searchVM.decreaseCurrentResult();
    else {
        mainVM.toVM.searchVM.currentSelectedResult(0);
        mainVM.toVM.searchVM.saved_name($('#searchFieldTo').val());
    }
}

function fromKeyUp(event) {
    if (event.keyCode == 13)
        mainVM.fromVM.searchVM.selectCurrentResult();
    else if (event.keyCode == 40)
        mainVM.fromVM.searchVM.increaseCurrentResult();
    else if (event.keyCode == 38)
        mainVM.fromVM.searchVM.decreaseCurrentResult();
    else {
        mainVM.fromVM.searchVM.currentSelectedResult(0);
        mainVM.fromVM.searchVM.saved_name($('#searchFieldFrom').val());
    }
}

var clearAutocomplete;

$(document).on('pagecreate', function () {
    $('#eventDatePicker').date();
    $('#eventDatePicker').date('setDate', '0');
    $('#eventDatePicker').on("change",
	  function (dateText) {
	      mainVM.eventsVM.currentDate($("#eventDatePicker").date("getDate"));
	  }
	);

    $('#googleSearchDiv .ui-input-clear').on('mousedown', function (event) {
        cancelGoogleBlur = true;
        var funcwithdelay = $.delayInvoke(function (event) {
            mainVM.fromVM.googleVM.resultsList.removeAll();
            mainVM.fromVM.googleVM.results_visible(false);
        }, 100);
        funcwithdelay();
    });
    $('#toSearchDiv .ui-input-clear').on('mousedown', function (event) {
        mainVM.toVM.searchVM.saved_name('');
        var funcwithdelay = $.delayInvoke(function (event) {
            $('#searchFieldTo').blur();
        }, 100);
        funcwithdelay();
    });
    $('#fromSearchDiv .ui-input-clear').on('mousedown', function (event) {
        mainVM.fromVM.searchVM.saved_name('');
        var funcwithdelay = $.delayInvoke(function (event) {
            $('#searchFieldFrom').blur();
        }, 100);
        funcwithdelay();
    });

    $(".printpopup").on('popupafteropen', function (event, ui) {
        var funcwithdelay = $.delayInvoke(function (event) {
            try {
                $('.driveMap').checkboxradio();
                $('.driveMap').checkboxradio("refresh");
            } catch (e) { }
            try {
                $('.driveDir').checkboxradio();
                $('.driveDir').checkboxradio("refresh");
            } catch (e) { }
            try {
                $('.walkMap').checkboxradio();
                $('.walkMap').checkboxradio("refresh");
            } catch (e) { }
            try {
                $('.walkDir').checkboxradio();
                $('.walkDir').checkboxradio("refresh");
            } catch (e) { }
        }, 0);
        funcwithdelay();
    });
    $('#destination-list-table-popup').popup({
        history: false
    });

    $(document).on('pagebeforecreate', function (event, data) {
        mainVM.clientVM.refreshTabs();
    });

    // Bind to StateChange Event
    //History.Adapter.bind(window, 'statechange', function (evt) { // Note: We are using statechange instead of popstate
    //    getViewState();
    //});.eventsVM.Populat

    $(window).on("navigate", function (event, data) {
        //if (initialized) getViewState();
    });

    $('#data table.ui-table tbody tr').on('click', function () {
        $($(this).find("a")[0]).click();
    });
    $('.pageButton').off().on('click', function (evt) {
        var activePage = $("body").pagecontainer("getActivePage");
        evt.preventDefault();
        if ($(this).hasClass('pageButton')) {
            if ($(this).hasClass('eventsButton')) {
                mainVM.eventsVM.PopulateEvents();
            }
            if ($(this).attr('id') == 'directionsLink' && (mainVM.searchStart_visible() == true || mainVM.searchEnd_visible() == true || !mainVM.DirectionBtnEnabled())) {
                return;
            }

            if ($(this).attr('href').replace('#', '') == 'printable') {
                if ($(this).attr('target') === "_blank" && mainVM.printableVM.isPrintEnabled()) {
                    window.open(window.location.origin + "/" + "#printable" + window.location.hash.substring(window.location.hash.indexOf('?')));
                    return false;
                }

                if ($(this).hasClass('summaryButton')) {
                    if ((mainVM.start_location().isOffCampus && !mainVM.start_location().isOffCampus()) && (mainVM.end_location().isOffCampus && !mainVM.end_location().isOffCampus())) {
                        PushNewState("page=printable&printing=3");
                        mainVM.printableVM.setPrinting(3);
                    } else {
                        PushNewState("page=printable&printing=15");
                        mainVM.printableVM.setPrinting(15);
                    }
                    mainVM.storageObject.isPrinted = false;                 
                }
                if (!mainVM.printableVM.isPrintEnabled()) {
                    ShowPopupWarningSpan();
                    return false;
                }
                if ($(this).hasClass('printButton')) {
                    PushNewState("page=printable&printing=" + mainVM.printableVM.PrintingValue());
                    mainVM.storageObject.isPrinted = true;
                }              
                /*var funcwithdelay = $.delayInvoke(function (event) {
					mainVM.printableVM.updateWalkingDivs();
				}, 0);
				funcwithdelay();*/

                //return;
            }


            if ($(this).attr('id') == 'continueBtn' || $(this).attr('id') == 'directionsBtn' || $(this).attr('id') == 'directionsLink' || $(this).attr('id') == 'popupCampusBtn') {
                if (!mainVM.storageObject.directionsTime) {
                    mainVM.storageObject.directionsTime = new Date().getTime();
                }
                if (mainVM.toVM.selectedParkingID() > 0 || $(this).attr('id') == 'directionsBtn') {
                    PushNewState('parking=' + mainVM.toVM.selectedParkingID());
                    getViewState($(this).attr('href').replace('#', ''));
                } else if ($(this).attr('id') == 'continueBtn') {
                    $('.popupWarningSpan').addClass("show");
                    $('.popupWarningSpan').css("opacity", "1");
                    $('.popupWarningSpan').stop().animate({
                        opacity: 0.001
                    }, 5000, function () {
                        $('.popupWarningSpan').removeClass("show");
                        $('.popupWarningSpan').css("opacity", "0");
                    });
                    return false;
                } else if ($(this).attr('id') == 'popupCampusBtn') {
                    PushNewState('parking=' + mainVM.toVM.selectedParkingID());
                    getViewState($(this).attr('href').replace('#', ''));
                }
            }
            if (activePage[0].id != $(this).attr('href').replace('#', '')) {
                PushNewState('page=' + $(this).attr('href').replace('#', ''));
            }
            if (mainVM.storageObject.SessionID) UpdateSession(mainVM.storageObject.SessionID, mainVM.storageObject.isPrinted, mainVM.storageObject.isEmailed);
        } else {
            $(mainVM.directionsHref()).popup("open");
            return false;
        }
    });
    //if(!window.chrome){
    //$('.getDirectionsButton').on('click',function(){
    //DrawDirections();
    //  });
    //}
    //$('[data-role=footer]').fixedtoolbar({ tapToggle:false });

});


function ShowPopupWarningSpan() {
    $('.popupWarningSpan').addClass("show");
    $('.popupWarningSpan').css("opacity", "1");
    $('.popupWarningSpan').stop().animate({
        opacity: 0.001
    }, 5000, function () {
        $('.popupWarningSpan').removeClass("show");
        $('.popupWarningSpan').css("opacity", "0");
    });
}

$(document).bind("pagechange", function (event, data) {
    if (data.toPage[0].id == "walking") mainVM.ljdirectionsVM.resizeSVG();
    if (mainVM.clientVM.clientID())
        getViewState();
    var pageId = data.toPage[0].id;
    if (pageId === "driving" || pageId === "drivingdirections") {
        // resize the google map and directions before switching to the page
        resizeGoogleMaps();
    }
});
var refresh_prepare = 1;

function checkRefresh() {
    // Get the time now and convert to UTC seconds
    var today = new Date();
    var now = today.getUTCSeconds();

    // Get the cookie
    var cookie = document.cookie;
    var cookieArray = cookie.split('; ');

    // Parse the cookies: get the stored time
    for (var loop = 0; loop < cookieArray.length; loop++) {
        var nameValue = cookieArray[loop].split('=');
        // Get the cookie time stamp
        if (nameValue[0].toString() == 'SHTS') {
            var cookieTime = parseInt(nameValue[1]);
        }
            // Get the cookie page
        else if (nameValue[0].toString() == 'SHTSP') {
            var cookieName = nameValue[1];
        }
    }

    if (cookieName &&
		cookieTime &&
		cookieName == escape(location.href) &&
		Math.abs(now - cookieTime) < 5) {
        for (var loop = 0; loop < cookieArray.length; loop++) {
            var nameValue = cookieArray[loop].split('=');
            // Get the cookie time stamp
            mainVM.storageObject[nameValue[0].toString()] = nameValue[1] == "undefined" || nameValue[1] == "null" ? null : nameValue[1];
        }
        mainVM.storageObject.isRefresh = true;
        if (mainVM.storageObject.SessionID) UpdateSession(mainVM.storageObject.SessionID, mainVM.storageObject.isPrinted, mainVM.storageObject.isEmailed);
        // Refresh detected

        // Insert code here representing what to do on
        // a refresh

        // If you would like to toggle so this refresh code
        // is executed on every OTHER refresh, then 
        // uncomment the following line
        // refresh_prepare = 0; 
    } else {
        mainVM.storageObject.isRefresh = false;
    }

    // You may want to add code in an else here special 
    // for fresh page loads
}

function prepareForRefresh() {
    if (refresh_prepare > 0) {
        // Turn refresh detection on so that if this
        // page gets quickly loaded, we know it's a refresh
        var today = new Date();
        var now = today.getUTCSeconds();
        document.cookie = 'SHTS=' + now;
        document.cookie = 'SHTSP=' + escape(location.href);
        document.cookie = 'loadTime=' + mainVM.storageObject.loadTime;
        document.cookie = 'toSearchType=' + mainVM.storageObject.toSearchType;
        document.cookie = 'fromSearchType=' + mainVM.storageObject.fromSearchType;
        document.cookie = 'directionsTime=' + mainVM.storageObject.directionsTime;
        document.cookie = 'SessionID=' + mainVM.storageObject.SessionID;
        document.cookie = 'StartDestinationName=' + mainVM.storageObject.StartDestinationName;;
        document.cookie = 'EndDestinationName=' + mainVM.storageObject.EndDestinationName;;
    } else {
        // Refresh detection has been disabled
        document.cookie = 'SHTS=';
        document.cookie = 'SHTSP=';
        document.cookie = 'toSearchType=';
        document.cookie = 'fromSearchType=';
        document.cookie = 'directionsTime=';
        document.cookie = 'SessionID=0';
        document.cookie = 'StartDestinationName=';
        document.cookie = 'EndDestinationName=';
    }
}

function importNode(node, allChildren) {
    if (node) {
        switch (node.nodeType) {
            case document.ELEMENT_NODE:
                var newNode = document.createElementNS(node.namespaceURI, node.nodeName);
                if (node.attributes && node.attributes.length > 0)
                    for (var i = 0, il = node.attributes.length; i < il; i++)
                        newNode.setAttribute(node.attributes[i].nodeName, node.getAttribute(node.attributes[i].nodeName));
                if (allChildren && node.childNodes && node.childNodes.length > 0)
                    for (var i = 0, il = node.childNodes.length; i < il; i++)
                        newNode.appendChild(importNode(node.childNodes[i], allChildren));
                return newNode;
                break;
            case document.TEXT_NODE:
            case document.CDATA_SECTION_NODE:
            case document.COMMENT_NODE:
                return document.createTextNode(node.nodeValue);
                break;
        }
    }
}

function UpdateSession(SessionID, IsPrinted, IsEmailed) {
    mainVM.storageObject.IsPrinted = IsPrinted;
    mainVM.storageObject.IsEmailed = IsEmailed;
    mainVM.storageObject.ID = SessionID;
    if (!mainVM.storageObject.SessionID) mainVM.storageObject.SessionID = 0;
    if (!mainVM.storageObject.isRefresh) mainVM.storageObject.isRefresh = false;
    if (!mainVM.storageObject.loadTime) mainVM.storageObject.loadTime = 0;
    if (!mainVM.storageObject.toSearchType) mainVM.storageObject.toSearchType = "";
    if (!mainVM.storageObject.EndDestinationName) mainVM.storageObject.EndDestinationName = "";
    if (!mainVM.storageObject.fromSearchType) mainVM.storageObject.fromSearchType = "";
    if (!mainVM.storageObject.StartDestinationName) mainVM.storageObject.StartDestinationName = "";
    if (!mainVM.storageObject.ParkingType) mainVM.storageObject.ParkingType = 0;
    if (!mainVM.storageObject.ClientID) mainVM.storageObject.ClientID = 0;
    if (!mainVM.storageObject.IsPrinted) mainVM.storageObject.IsPrinted = false;
    if (!mainVM.storageObject.IsEmailed) mainVM.storageObject.IsEmailed = false;
    if (!mainVM.storageObject.ID) mainVM.storageObject.ID = 0;
    if (!mainVM.storageObject.directionsTime) mainVM.storageObject.directionsTime = 0;
    if (!mainVM.storageObject.sourceType) mainVM.storageObject.sourceType = "";
    $.ajax({
        url: mainVM.UpdateSessionURL + "?" + getJsonpSuffix(),
        type: "GET",
        data: mainVM.storageObject,
        dataType: getJsonDataType(),
        contentType: getJsonContentType(),
        success: function (id) {
            mainVM.storageObject.SessionID = id;
        }
    });
}
