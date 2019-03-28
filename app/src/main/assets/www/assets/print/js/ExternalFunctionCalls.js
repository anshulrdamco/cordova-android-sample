//var RESTSERVICESBASE = "http://wayfinderlj-restservice.cloudapp.net/MobileService.svc/";
//var RESTSERVICESBASE = "http://ef76d7d3e6c0436fa4c6c3b4e753c966.cloudapp.net/MobileService.svc/"; //Prod Staging
//var RESTSERVICESBASE = "http://localhost:60001/MobileService.svc/";

//var RESTSERVICESBASE = "http://localhost:52149/";
var RESTSERVICESBASE = "http://ljrestservice-dev.azurewebsites.net/";
//var RESTSERVICESBASE = "http://ljrestservicestaging.azurewebsites.net/";
// var RESTSERVICESBASE = "http://ljrestservice.azurewebsites.net/";

//var KIOSKREPORTURL = "http://localhost:52686//KioskTraffic/Report";
var KIOSKREPORTURL = "http://admindev.yourdirectroute.com/KioskTraffic/Report";
//var KIOSKREPORTURL = "http://adminstage.yourdirectroute.com/KioskTraffic/Report";
//var KIOSKREPORTURL = "http://admin.yourdirectroute.com/KioskTraffic/Report";

var TRANSLATEURL = RESTSERVICESBASE + "api/translation/";
var PORTALPARAMETERURL = RESTSERVICESBASE + "api/PortalParameter/";
var TOP10URL = RESTSERVICESBASE + "api/SelectedDestinations/";
var SEARCHURL = RESTSERVICESBASE + "api/destination/";
var MENUDATAURL = RESTSERVICESBASE + "api/ClientMenuItem/";
var GETEVENTSURL = RESTSERVICESBASE + "api/event/";
var GETEVENTSONLINEURL = RESTSERVICESBASE + "api/event/getByDateRange";
var GETTODAYACTIVEEVENTSURL = RESTSERVICESBASE + "api/event/get";
var GETDESTINATIONDATAURL = RESTSERVICESBASE + "api/destination/";
var GETFLOORLISTURL = RESTSERVICESBASE + "api/floor/";
var GETQUICKLINKDATAURL = RESTSERVICESBASE + "api/kiosk/";
var GETMAPURL = RESTSERVICESBASE + "api/map/";
var SENDDIRECTIONSURL = RESTSERVICESBASE + "api/email/";
var GETDIRECTIONSURL = RESTSERVICESBASE + "api/directions/";
//var SVGBASELOCATION = "http://blob.yourdirectroute.com/wayfinder-blob/";
var SVGBASELOCATION = "http://blob.yourdirectroute.com/wayfinder-blob-dev/";
//var SVGBASELOCATION = "http://localhost:62960/WebBasedKiosk/wayfinderblobdev/";
//var SVGBASELOCATION = "http://blob.yourdirectroute.com/wayfinder-blob-stage/";
//var SVGBASELOCATION = "http://blob.yourdirectroute.com/wayfinder-blob-local/";

function TranslateText(language, text, callback, callbackArgs) {
    if (language == 'english') callback(text, callbackArgs);
    if (window.external && ('TranslateText' in window.external)) {
        window.external.TranslateText(language, text, function (result) {
            callback(result, callbackArgs);
        });
    } else {
        $.ajax({
            url: TRANSLATEURL + "?l=" + language + "&t=" + text + "&c=" + mainVM.ClientVM.clientID() + getJsonpSuffix(),
            type: "GET",
            dataType: getJsonDataType(),
            contentType: getJsonContentType(),
            success: function (response) {
                callback(response, callbackArgs);
            }
        });
    }
}

function GetPortalParameters(host, callback) {
    if (window.external && ('GetPortalParameters' in window.external)) {
        window.external.GetPortalParameters(function (jsonString) {
            var escapedJson = escapeJSON(jsonString);
            var jsonObject = JSON.parse(escapedJson);
            callback(jsonObject);
        });
    } else {
        $.ajax({
            url: PORTALPARAMETERURL + "?host=" + (host ? host : window.location.host) + getJsonpSuffix(),
            type: "GET",
            dataType: getJsonDataType(),
            contentType: getJsonContentType(),
            success: callback
        });
    }
}

function GetSelectedDestinations(clientID, count, callback) {
    if (window.external && ('GetSelectedDestinations' in window.external)) {
        window.external.GetSelectedDestinations(count, function (jsonString) {
            var escapedJson = escapeJSON(jsonString);
            var jsonObject = JSON.parse(escapedJson);
            callback(jsonObject);
        });
    } else {
        $.ajax({
            url: TOP10URL + '?ClientID=' + clientID + '&Count=' + count + getJsonpSuffix(),
            type: "GET",
            dataType: getJsonDataType(),
            contentType: getJsonContentType(),
            success: callback
        });
    }
}

function GetSearchDestinations(clientID, searchString, callback) {
    if (window.external && ('GetSearchDestinations' in window.external)) {
        window.external.GetSearchDestinations(searchString, function (jsonString) {
            var escapedJson = escapeJSON(jsonString);
            var jsonObject = JSON.parse(escapedJson);
            callback(jsonObject);
        });
    } else {
        $.ajax({
            url: SEARCHURL + '?ClientID=' + clientID + '&SearchString=' + searchString + getJsonpSuffix(),
            type: "GET",
            dataType: getJsonDataType(),
            contentType: getJsonContentType(),
            success: callback
        });
    }
}

function GetMenuItems(clientID, callback) {
    if (window.external && ('GetMenuItems' in window.external)) {
        window.external.GetMenuItems(function (jsonString) {
            var escapedJson = escapeJSON(jsonString);
            var jsonObject = JSON.parse(escapedJson);
            callback(jsonObject);
        });
    } else {
        $.ajax({
            url: MENUDATAURL + '?ClientID=' + clientID + getJsonpSuffix(),
            type: "GET",
            dataType: getJsonDataType(),
            contentType: getJsonContentType(),
            success: callback
        });
    }
}

function GetEvents(clientID, start, end, callback) {
    if (window.external && ('GetEvents' in window.external)) {
        window.external.GetEvents(start, end, function (jsonString) {
            var escapedJson = escapeJSON(jsonString);
            var jsonObject = JSON.parse(escapedJson);
            callback(jsonObject);
        });
    } else {
        $.ajax({
            url: GETEVENTSURL + '?ClientID=' + clientID + '&s=' + start + '&e=' + end + getJsonpSuffix(),
            type: "GET",
            dataType: getJsonDataType(),
            contentType: getJsonContentType(),
            success: callback
        });
    }
}

function GetEventsOnline(clientID, start, end, callback) {
    $.ajax({
        url: GETEVENTSONLINEURL + '?ClientID=' + clientID + '&s=' + start + '&e=' + end + getJsonpSuffix(),
        type: "GET",
        dataType: getJsonDataType(),
        contentType: getJsonContentType(),
        success: callback
    });
}


function GetTodayEvents(clientID, start, callback) {
    if (window.external && ('GetTodayEvents' in window.external)) {
        window.external.GetTodayEvents(function (jsonString) {
            var escapedJson = escapeJSON(jsonString);
            var jsonObject = JSON.parse(escapedJson);
            callback(jsonObject);
        });
    } else {
        $.ajax({
            url: GETTODAYACTIVEEVENTSURL + '?ClientID=' + clientID + "&s=" + start + getJsonpSuffix(),
            type: "GET",
            dataType: getJsonDataType(),
            contentType: getJsonContentType(),
            success: callback
        });
    }
}

function GetDestinationData(DestinationType, ClientID, Filter, Sort, StartIndex, PageSize, callback) {
    if (window.external && ('GetDestinationData' in window.external)) {
        window.external.GetDestinationData(DestinationType, Filter, Sort, StartIndex, PageSize, function (jsonString) {
            var escapedJson = escapeJSON(jsonString);
            var jsonObject = JSON.parse(escapedJson);
            callback(jsonObject);
        });
    } else {
        $.ajax({
            url: GETDESTINATIONDATAURL + '?ClientDestinationTypeID=' + DestinationType + '&ClientID=' + ClientID + "&Filter=" + Filter + "&Sorting=" + Sort + "&StartIndex=" + StartIndex + "&PageSize=" + PageSize + getJsonpSuffix(),
            type: "GET",
            dataType: getJsonDataType(),
            contentType: getJsonContentType(),
            success: callback
        });
    }
}

function GetFloorList(clientID, callback) {
    if (window.external && ('GetFloorList' in window.external)) {
        window.external.GetFloorList(function (jsonString) {
            var escapedJson = escapeJSON(jsonString);
            var jsonObject = JSON.parse(escapedJson);
            callback(jsonObject);
        });
    } else {
        $.ajax({
            url: GETFLOORLISTURL + '?ClientID=' + clientID + getJsonpSuffix(),
            type: "GET",
            dataType: getJsonDataType(),
            contentType: getJsonContentType(),
            success: callback
        });
    }
}

function GetQuicklinkData(clientID, quicklink, callback) {
    if (window.external && ('GetQuicklinkData' in window.external)) {
        window.external.GetQuicklinkData(function (jsonString) {
            var escapedJson = escapeJSON(jsonString);
            var jsonObject = JSON.parse(escapedJson);
            callback(jsonObject);
        });
    } else {
        $.ajax({
            url: GETQUICKLINKDATAURL + '?ClientID=' + clientID + '&QuickLink=' + quicklink + getJsonpSuffix(),
            type: "GET",
            dataType: getJsonDataType(),
            contentType: getJsonContentType(),
            success: callback
        });
    }
}

function GetMapURL(mapID, callback) {
    if (window.external && ('GetMapURL' in window.external)) {
        window.external.GetMapURL(mapID, function (jsonString) {
            var escapedJson = escapeJSON(jsonString);
            var jsonObject = JSON.parse(escapedJson);
            callback(jsonObject);
        });
    } else {
        $.ajax({
            url: GETMAPURL + '?MapID=' + mapID + getJsonpSuffix(),
            type: "GET",
            dataType: getJsonDataType(),
            contentType: getJsonContentType(),
            success: callback
        });
    }
}

function GetDirections(clientID, start, end, language, callback) {
    if (window.external && ('GetDirections' in window.external)) {
        window.external.GetDirections(end, language, function (jsonString) {
            var escapedJson = escapeJSON(jsonString);
            var jsonObject = JSON.parse(escapedJson);
            callback(jsonObject);
        });
    } else {
        $.ajax({
            url: GETDIRECTIONSURL + '?ClientID=' + clientID + '&s=' + start + '&e=' + end + '&pt=0&l=' + language + getJsonpSuffix(),
            type: "GET",
            dataType: getJsonDataType(),
            contentType: getJsonContentType(),
            success: callback
        });
    }
}

function OnlineStatusCheck(callback) {
    if (window.external && ('OnlineStatus' in window.external)) {
        window.external.OnlineStatus(function (jsonString) {
            var escapedJson = escapeJSON(jsonString);
            var jsonObject = JSON.parse(escapedJson);
            callback(jsonObject);
        });
    }
}

function GetMapXML(filename, callback) {
    if (window.external && ('GetMapXML' in window.external)) {
        window.external.GetMapXML(filename, function (xmlString) {
            var escapedXML = escapeJSON(xmlString);
            callback(escapedXML);
        });
    } else {
        $.ajax({
            url: GETMAPURL + "?FileURL=" + SVGBASELOCATION + filename + getJsonpSuffix(),
            type: "GET",
            dataType: getJsonDataType(),
            contentType: getJsonContentType(),
            success: callback
        });
    }
}

function GetDataURL(filename, callback) {
    if (window.external && ('GetDataURL' in window.external)) {
        window.external.GetDataURL(filename, function (result) {
            callback(result);
        });
    }
}

function SaveReportingInfo(id, screen, eventtype, specificdata, quicklink, language) {
    if (ALLOWREPORTING) {
        if (window.external && ('SaveReportingInfo' in window.external)) {
            window.external.SaveReportingInfo(id, screen, eventtype, specificdata, quicklink, language, new Date().getTime());
        } else {
            $.ajax({
                url: KIOSKREPORTURL,
                type: "GET",
                dataType: getJsonDataType(),
                contentType: getJsonContentType(),
                data: { id: id, serial: null, screen: screen, eventtype: eventtype, specificdata: specificdata, quicklink: quicklink, language: language }
            });
        }
    }
}

function escapeJSON(jsonString) {
    // This only replaces new lines. Add more escapes here
    return jsonString.replace(/\r?\n/g, "");
}