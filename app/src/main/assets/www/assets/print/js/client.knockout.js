function ClientViewModel() {
    var self = this;
    self.clientID = ko.observable(0).syncWith('ClientID');
    self.imagePath = ko.observable('');
    self.cssPath = ko.observable("css/logicjunction.min.css");
    //self.mapCssPath = ko.observable("https://ljimageblob.blob.core.windows.net/wayfinder-common/mapStyles.css");
    self.mapCssPath = ko.observable(COMMONBLOB + "mapStyles.css");
    self.themeOverrideCssPath = ko.observable();
    self.locationName = ko.observable('');
    self.CompanyName = ko.observable('');
    self.address = ko.observable('');
    self.phone = ko.observable('');
    self.fax = ko.observable('');
    self.webtext = ko.observable('');
    self.weblink = ko.observable('');
    self.apptLink = ko.observable('');
    self.apptText = ko.observable('');
    self.PrintHeader = ko.observable('');
    self.PrintFooter = ko.observable('');
    self.CampusMessage = ko.observable('');
    self.MainHeaderText = ko.observable('the hospital');
    self.GoogleTabShortText = ko.observable('Map');
    self.DrivingTabShortText = ko.observable('Drive');
    self.WalkingTabShortText = ko.observable('Walk');
    self.MapsTabShortText = ko.observable('Hospital');
    self.GoogleTabLongText = ko.observable('Map');
    self.DrivingTabLongText = ko.observable('Drive');
    self.WalkingTabLongText = ko.observable('Walk');
    self.MapsTabLongText = ko.observable('Hospital');
    self.FirstAdAndroidLink = ko.observable('');
    self.SecondAdAndroidLink = ko.observable('');
    self.ThirdAdAndroidLink = ko.observable('');
    self.FirstAdIOSLink = ko.observable('');
    self.SecondAdIOSLink = ko.observable('');
    self.ThirdAdIOSLink = ko.observable('');
    self.FirstAdImage = ko.observable('');
    self.SecondAdImage = ko.observable('');
    self.ThirdAdImage = ko.observable('');
    self.FirstAdMobile = ko.observable('');
    self.SecondAdMobile = ko.observable('');
    self.ThirdAdMobile = ko.observable('');
    self.EnableOpenPrintPreviewInNewTab = ko.observable(false);
    self.EventXML = ko.observable('');
    self.FirstAdLink = function () {
        if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false && self.FirstAdIOSLink()) {
            return self.FirstAdIOSLink();
        } else if (self.FirstAdAndroidLink()) {
            return self.FirstAdAndroidLink();
        }
        return false;
    };
    self.SecondAdLink = function () {
        if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false && self.SecondAdIOSLink()) {
            return self.SecondAdIOSLink();
        } else if (self.SecondAdAndroidLink()) {
            return self.SecondAdAndroidLink();
        }
        return false;
    };
    self.ThirdAdLink = function () {
        if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false && self.ThirdAdIOSLink()) {
            return self.ThirdAdIOSLink();
        } else if (self.ThirdAdAndroidLink()) {
            return self.ThirdAdAndroidLink();
        }
        return false;
    };
    self.mainLatLng = new google.maps.LatLng(39.740619, -75.606773);
    self.legendArray = ko.observableArray([{ type: "parking", text: 'Parking Lot' },
    { type: "busstop", text: 'Bus' },
    { type: "restroom", text: 'Restroom' },
    { type: "elevators", text: 'Elevator' },
    { type: "atm", text: 'ATM' },
    { type: "vending", text: 'Vending' }]);
    self.logoNormal = "";
    self.logoSmall = "";
    self.campusArray = ko.observableArray();
    self.campusAddress = function (campusValue) {
        for (var i = 0; i < self.campusArray().length; i++) {
            var val = self.campusArray()[i];
            if (val.QLValue == campusValue) {
                return val.Address;
            }
        }
        return "";
    }
    self.refreshTabs = function () {
        self.GoogleTabShortText.valueHasMutated();
        self.DrivingTabShortText.valueHasMutated();
        self.WalkingTabShortText.valueHasMutated();
        self.MapsTabShortText.valueHasMutated();
        self.GoogleTabLongText.valueHasMutated();
        self.DrivingTabLongText.valueHasMutated();
        self.WalkingTabLongText.valueHasMutated();
        self.MapsTabLongText.valueHasMutated();
    }
    self.setLogoImage = function () {
        if ($(window).width() < 768) {
            // self.imagePath(COMMONBLOB + self.logoSmall);
        } else {
            // self.imagePath(COMMONBLOB + self.logoNormal);
        }
        /*var activePage = $( "body" ).pagecontainer( "getActivePage" );
		if (activePage && activePage[0].id === "printable") {
			self.imagePath(COMMONBLOB + self.logoNormal);
		}*/
    };

    self.imagePath.subscribe(function (newValue) {
        setTimeout(function () { $('a.logo img').addClass('show'); }, 500);

    });

    self.LoadPortalParameters = function (callback) {
        $.support.cors = true;
        var host = getParameterByName(window.location.href, "host");
        var url = mainVM.GetPortalParametersUrl + "?host=" + (host ? host : window.location.host);
        $.getJSON(url,
        //$.ajax({
        //    url: mainVM.GetPortalParametersUrl + "?host=" + (host ? host : window.location.host),
        //    type: "GET",
        //    dataType: "json",
        //    //contentType: "application/json",
            //success: 
            function (result) {
                if (result.Status == "Success") {
                    let data = result.Response;
                    if (data.ClientViewModel.clientID) self.clientID(data.ClientViewModel.clientID);
                    if (data.ClientViewModel.imagePath) self.imagePath(data.ClientViewModel.imagePath);
                    if (data.ClientViewModel.themeOverrideCssPath) self.themeOverrideCssPath(data.ClientViewModel.themeOverrideCssPath);
                    if (data.ClientViewModel.cssPath) self.cssPath(data.ClientViewModel.cssPath);
                    if (data.ClientViewModel.mapCssPath) self.mapCssPath(COMMONBLOB + data.ClientViewModel.mapCssPath);
                    if (data.ClientViewModel.locationName) self.locationName(data.ClientViewModel.locationName);
                    if (data.ClientViewModel.CompanyName) self.CompanyName(data.ClientViewModel.CompanyName);
                    if (data.ClientViewModel.address) self.address(data.ClientViewModel.address);
                    if (data.ClientViewModel.phone) self.phone(data.ClientViewModel.phone);
                    if (data.ClientViewModel.fax) self.fax(data.ClientViewModel.fax);
                    if (data.ClientViewModel.webtext) self.webtext(data.ClientViewModel.webtext);
                    if (data.ClientViewModel.weblink) self.weblink(data.ClientViewModel.weblink);
                    if (data.ClientViewModel.apptLink) self.apptLink(data.ClientViewModel.apptLink);
                    if (data.ClientViewModel.apptText) self.apptText(data.ClientViewModel.apptText);
                    if (data.ClientViewModel.PrintHeader) self.PrintHeader(data.ClientViewModel.PrintHeader);
                    if (data.ClientViewModel.PrintFooter) self.PrintFooter(data.ClientViewModel.PrintFooter);
                    if (data.ClientViewModel.GoogleTabLongText) self.GoogleTabLongText(data.ClientViewModel.GoogleTabLongText);
                    if (data.ClientViewModel.DrivingTabLongText) self.DrivingTabLongText(data.ClientViewModel.DrivingTabLongText);
                    if (data.ClientViewModel.WalkingTabLongText) self.WalkingTabLongText(data.ClientViewModel.WalkingTabLongText);
                    if (data.ClientViewModel.MapsTabLongText) self.MapsTabLongText(data.ClientViewModel.MapsTabLongText);
                    if (data.ClientViewModel.GoogleTabShortText) self.GoogleTabShortText(data.ClientViewModel.GoogleTabShortText);
                    if (data.ClientViewModel.DrivingTabShortText) self.DrivingTabShortText(data.ClientViewModel.DrivingTabShortText);
                    if (data.ClientViewModel.WalkingTabShortText) self.WalkingTabShortText(data.ClientViewModel.WalkingTabShortText);
                    if (data.ClientViewModel.MapsTabShortText) self.MapsTabShortText(data.ClientViewModel.MapsTabShortText);
                    if (data.ClientViewModel.FirstAdAndroidLink) self.FirstAdAndroidLink(data.ClientViewModel.FirstAdAndroidLink);
                    if (data.ClientViewModel.SecondAdAndroidLink) self.SecondAdAndroidLink(data.ClientViewModel.SecondAdAndroidLink);
                    if (data.ClientViewModel.ThirdAdAndroidLink) self.ThirdAdAndroidLink(data.ClientViewModel.ThirdAdAndroidLink);
                    if (data.ClientViewModel.FirstAdIOSLink) self.FirstAdIOSLink(data.ClientViewModel.FirstAdIOSLink);
                    if (data.ClientViewModel.SecondAdIOSLink) self.SecondAdIOSLink(data.ClientViewModel.SecondAdIOSLink);
                    if (data.ClientViewModel.ThirdAdIOSLink) self.ThirdAdIOSLink(data.ClientViewModel.ThirdAdIOSLink);
                    if (data.ClientViewModel.FirstAdImage) self.FirstAdImage(data.ClientViewModel.FirstAdImage);
                    if (data.ClientViewModel.SecondAdImage) self.SecondAdImage(data.ClientViewModel.SecondAdImage);
                    if (data.ClientViewModel.ThirdAdImage) self.ThirdAdImage(data.ClientViewModel.ThirdAdImage);
                    if (data.ClientViewModel.FirstAdMobile) self.FirstAdMobile(data.ClientViewModel.FirstAdMobile);
                    if (data.ClientViewModel.SecondAdMobile) self.SecondAdMobile(data.ClientViewModel.SecondAdMobile);
                    if (data.ClientViewModel.ThirdAdMobile) self.ThirdAdMobile(data.ClientViewModel.ThirdAdMobile);
                    if (data.ClientViewModel.EnableOpenPrintPreviewInNewTab) {
                        self.EnableOpenPrintPreviewInNewTab(data.ClientViewModel.EnableOpenPrintPreviewInNewTab == "True" || data.ClientViewModel.EnableOpenPrintPreviewInNewTab == "true" || data.ClientViewModel.EnableOpenPrintPreviewInNewTab == true);
                    }
      
                    if (data.ClientViewModel.EventXML) self.EventXML(data.ClientViewModel.EventXML);
                    //else self.EventXML('http://admin.yourdirectroute.com/Event/EventXML'+(supportsCORS() ? '' : 'JsonP')+'?clientID='+self.clientID());
                    //else self.EventXML('http://adminstage.yourdirectroute.com/Event/EventXML'+(supportsCORS() ? '' : 'JsonP')+'?clientID='+self.clientID());
                    else self.EventXML('https://admindev.yourdirectroute.com/Event/EventXML' + (supportsCORS() ? '' : 'JsonP') + '?clientID=' + self.clientID());
                    //else self.EventXML('http://localhost:52686//Event/EventXML'+(supportsCORS() ? '' : 'JsonP')+'?clientID='+self.clientID());
                    if (data.ClientViewModel.MainHeaderText) self.MainHeaderText(data.ClientViewModel.MainHeaderText);
      
                    if (data.ClientViewModel.mainLatLng) {
                        var mainLatLng = data.ClientViewModel.mainLatLng.split(',');
                        self.mainLatLng = new google.maps.LatLng(mainLatLng[0], mainLatLng[1]);
                    }
                    if (data.ClientViewModel.logoNormal) self.logoNormal = data.ClientViewModel.logoNormal;
                    if (data.ClientViewModel.logoSmall) self.logoSmall = data.ClientViewModel.logoSmall;
      
                    self.legendArray.removeAll();
      
                    if (data.legendArray) {
                        for (key in data.legendArray) {
                            self.legendArray.push({ type: data.legendArray[key], text: key });
                        }
                    }
                    if (data.ClientViewModel.MapHeight) SVGHEIGHT = parseInt(data.ClientViewModel.MapHeight);
                    if (data.ClientViewModel.MapWidth) SVGWIDTH = parseInt(data.ClientViewModel.MapWidth);
                    if (data.campusArray) {
                        self.campusArray.removeAll();
      
                        for (key in data.campusArray) {
                            self.campusArray.push({ Address: data.campusArray[key], QLValue: key });
                        }
                    }
      
                    if (document.createStyleSheet) {
                        if (self.cssPath()) document.createStyleSheet(self.cssPath());
                        if (self.themeOverrideCssPath()) document.createStyleSheet(self.themeOverrideCssPath());
                        if (self.mapCssPath()) document.createStyleSheet(self.mapCssPath());
                    }
                    else {
                        if (self.cssPath()) {
                            var css;
                            css = document.createElement('link');
                            css.rel = 'stylesheet';
                            css.type = 'text/css';
                            css.media = "all";
                            css.href = self.cssPath();
                            document.getElementsByTagName("head")[0].appendChild(css);
                        }
                        if (self.themeOverrideCssPath()) {
                            var css;
                            css = document.createElement('link');
                            css.rel = 'stylesheet';
                            css.type = 'text/css';
                            css.media = "all";
                            css.href = self.themeOverrideCssPath();
                            document.getElementsByTagName("head")[0].appendChild(css);
                        }
                        if (self.mapCssPath()) {
                            var css;
                            css = document.createElement('link');
                            css.rel = 'stylesheet';
                            css.type = 'text/css';
                            css.media = "all";
                            css.href = self.mapCssPath();
                            document.getElementsByTagName("head")[0].appendChild(css);
                        }
                    }
                    $('#home').before('<style type="text/css">' +
                        'ul.legendList li span.legendIcon{background:transparent url(' + COMMONBLOB + "common/" + self.clientID() + '-sprite-legend.png) no-repeat 0 0;' +
                        '</style>');
      
                    callback();
                }
                else if (result.Status == "Denied") {
                    alert("Please enter correct url details !!");
                }
            },
            //error: 
            function (jqXHR, textStatus, errorThrown) {
                if (errorThrown.message && errorThrown.message.indexOf("Access is denied.") == 0 && _supportsCORS == true) {
                    _supportsCORS = false;
                    self.LoadPortalParameters(callback);
                }
                else
                    throw 'getJSON failed: ' + errorThrown + ' ' + mainVM.GetPortalParametersUrl + "?host=" + (getParameterByName(window.location.href, "host") || window.location.host) + getJsonpSuffix();
            }
        //});
        );
      };
}
