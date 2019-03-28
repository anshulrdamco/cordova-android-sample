
//-----------------------Common functions-----------------------//
//----------------------------Start-----------------------------//
(function () {
    window.extendedTimeout = function (callback, timeout) {
        var maxSetTimeoutLimit = 2147483647;

        if (timeout > maxSetTimeoutLimit) {
            return setTimeout(function () {
                return extendedTimeout(callback, timeout - maxSetTimeoutLimit);
            }, maxSetTimeoutLimit);
        }
        else {
            return setTimeout(callback, timeout);
        }
    }

    window.dateDiffInMilliSeconds = function (oldDate, newDate) {
        var utc1 = Date.UTC(oldDate.getFullYear(), oldDate.getMonth(), oldDate.getDate(), oldDate.getHours(), oldDate.getMinutes(), oldDate.getSeconds(), oldDate.getMilliseconds());
        var utc2 = Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), newDate.getHours(), newDate.getMinutes(), newDate.getSeconds(), newDate.getMilliseconds());

        return (utc2 - utc1);
    }

    window.dateAddMinutes = function (date, minutes) {
        var utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());

        utcDate = utcDate + minutes * 60 * 1000;

        return new Date(utcDate);
    }

    window.dateAdd = function (date, interval, units) {
        var ret = new Date(date); //don't change original date
        switch (interval.toLowerCase()) {
            case 'year': ret.setFullYear(ret.getFullYear() + units); break;
            case 'quarter': ret.setMonth(ret.getMonth() + 3 * units); break;
            case 'month': ret.setMonth(ret.getMonth() + units); break;
            case 'week': ret.setDate(ret.getDate() + 7 * units); break;
            case 'day': ret.setDate(ret.getDate() + units); break;
            case 'hour': ret.setTime(ret.getTime() + units * 3600000); break;
            case 'minute': ret.setTime(ret.getTime() + units * 60000); break;
            case 'second': ret.setTime(ret.getTime() + units * 1000); break;
            default: ret = undefined; break;
        }
        return ret;
    }

    window.dateDiffUptoHours = function (oldDate, newDate) {
        // Discard the time and time-zone information.
        var msPerHour = 1000 * 60 * 60;
        var msPerMinute = 1000 * 60;

        var diffInMilliSeconds = dateDiffInMilliSeconds(oldDate, newDate);

        var hours = padZeros(Math.floor(diffInMilliSeconds / msPerHour), 2);

        var remainingMilliSeconds = diffInMilliSeconds % msPerHour;
        var minutes = padZeros(Math.floor(remainingMilliSeconds / msPerMinute), 2);

        var remainingMilliSeconds = remainingMilliSeconds % msPerMinute;
        var seconds = padZeros(Math.ceil(remainingMilliSeconds / 1000), 2);

        if (seconds == 60) {
            if (minutes == 60) {
                hours++;
                minutes = 0;
            }

            minutes++;
            seconds = 0;

            if (minutes == 60) {
                hours++;
                minutes = 0;
            }
        }

        hours = padZeros(hours, 2);
        minutes = padZeros(minutes, 2);
        seconds = padZeros(seconds, 2);

        return "Active since " + hours + "hr " + minutes + "min " + seconds + "sec";
    }

    window.dateStringToDate=function(dateStr){
        var a=dateStr.split(" ");
        var d=a[0].split("-");
        var t=a[1].split(":");
        return new Date(d[0],(d[1]-1),d[2],t[0],t[1],t[2]);
    }

    window.padZeros = function (num, finalLength) {

        var curLength = num.toString().length;
        if (curLength >= finalLength) {
            return num;
        }

        if (num == 0) {
            var res = "";
            for (var i = 1; i <= finalLength; i++) {
                res += "0";
            }
            return res;
        }
        var divider = Math.pow(10, finalLength);
        var newNum = num / divider;
        var result = newNum.toString();
        result = result.substr(result.length - finalLength);
        return result;
    }
}());
//-----------------------------End------------------------------//

//-------------------------View Models--------------------------//
//----------------------------Start-----------------------------//
var AlertTypes = {
    Event: 'Event',
    Low: 'Low',
    Medium: 'Medium',
    High: 'High'
};

var AlertTypeOrder = {
    Event: 3,
    Low: 2,
    Medium: 1,
    High: 0
};

function AlertViewModel() {
    var self = this;

    self.Id;
    self.AlertType;
    self.Title = ko.observable();
    self.Message = ko.observable();
    self.ShortMessage = function () {
        return self.Message().substr(0, 111) + (self.Message().length > 111 ? " ..." : "");
    };
    self.ActivatedAt = ko.observable();
    self.EndedAt = ko.observable();
    self.ActiveDuration = ko.observable();
    self.EventDuration = ko.observable();
    self.Updates = ko.observableArray([]);
    self.LocationQuickLink = ko.observable();
    self.AlertLocationId = ko.observable();
    self.Map = ko.observable();
    self.CssClass = function () {
        switch (self.AlertType) {
            case AlertTypes.Medium: return 'midAlertYellow';
                break;
            case AlertTypes.Low: return 'lowAlertBlue';
                break;
        }
        return "";
    };
    self.EndTimeoutPointer;

    self.UpdateActiveDuration = function () {
        window.setInterval(function () {
            var dateDiff = dateDiffUptoHours(new Date(self.ActivatedAt()), new Date());
            self.ActiveDuration(dateDiff);
        }, 1000);
    }
}

function EventViewModel() {
    var self = this;

    self.Id;
    self.Title = ko.observable();
    self.Description = ko.observable();
    self.QuickLink = ko.observable();
    self.TimeRange = ko.observable();
    self.StartTime = ko.observable();
    self.EndTime = ko.observable();
}

function AlertUpdateViewModel() {
    var self = this;
    self.Id;
    self.PostedAt;
    self.AlertId;
    self.Comment = ko.observable();
    self.LocationQuickLink = ko.observable();
    self.LocationAddress = ko.observable();
    self.LocationDescription = ko.observable();
    self.LocationAffectedRadius = ko.observable();
    self.Map = ko.observable();
}

function AlertCorouselViewModel() {
    var self = this;

    self.Status = ko.observable();
    self.Duration = ko.observable();
    self.Alerts = ko.observableArray();
    self.AlertIndex = ko.observable(0);
    self.Interval = null;
    self.CurrentAlert = function () {
        return self.Alerts()[self.AlertIndex()];
    }
   
    self.StartCorousel = ko.computed(function () {
        if (self.Status()) {
            if (!self.Interval) {
                self.Interval = setInterval(function () {
                    increaseAlertIndex();
                }, self.Duration.peek() * 1000);
            }
        }
        else {
            if (self.Alerts.peek().length <= 0) {
                clearInterval(self.IntervalPointer);
                self.IntervalPointer = 0;
            }
        }
    });

    function increaseAlertIndex() {
        self.AlertIndex(self.AlertIndex() + 1);

        if (self.AlertIndex() >= self.Alerts().length) {
            self.AlertIndex(0);
        }
    }
}

function AlertModal(type, message) {

    //Alert : With Event and high alert
    //WEAlert : With Event Alert
    //WOEAlert : Without Event Alert
    var self = this;
    self.CurrentAlertType = ko.observable();

    self.ShowHighAlert = ko.observable(false);
    self.ShowOtherAlerts = ko.observable(false);
    self.ShowOtherAlert = ko.observable(false);

    self.Alerts = ko.observableArray([]);

    self.HighAlert = ko.computed(function () {
        var highAlerts = ko.utils.arrayFirst(self.Alerts(), function (alert) {
            return alert.AlertType == AlertTypes.High;
        });
        return highAlerts;
    });

    self.OtherAlerts = ko.computed(function () {
        var Alerts = ko.utils.arrayFilter(self.Alerts(), function (alert) {
            return alert.AlertType != AlertTypes.High
                && (alert.AlertType != AlertTypes.Event
                ||
                //(alert.AlertType == AlertTypes.Event &&  // This condition is required but here in second part of || its already Event type Alert
               dateStringToDate(alert.EndedAt()) > new Date()
                ); //));
        });

        Alerts.sort(function (left, right) {
            if (AlertTypeOrder[left.AlertType] == AlertTypeOrder[right.AlertType]) {
                return left.ActivatedAt() == right.ActivatedAt() ? 0 : (left.ActivatedAt() > right.ActivatedAt() ? 1 : -1);
            }
            else {
                return (AlertTypeOrder[left.AlertType] > AlertTypeOrder[right.AlertType] ? 1 : -1);
            }
        });
        return Alerts;
    });

    self.OtherAlertsWithoutEvent = ko.computed(function () {
        var Alerts = ko.utils.arrayFilter(self.Alerts(), function (alert) {
            return alert.AlertType != AlertTypes.High && alert.AlertType != AlertTypes.Event;
        });

        Alerts.sort(function (left, right) {
            if (AlertTypeOrder[left.AlertType] == AlertTypeOrder[right.AlertType]) {
                return left.ActivatedAt() == right.ActivatedAt() ? 0 : (left.ActivatedAt() > right.ActivatedAt() ? 1 : -1);
            }
            else {
                return (AlertTypeOrder[left.AlertType] > AlertTypeOrder[right.AlertType] ? 1 : -1);
            }
        });

        return Alerts;
    });

    self.ShowAlert = function (alertInfo) {

        var alert = ko.utils.arrayFirst(self.Alerts(), function (a) {
            return a.Id == alertInfo.Id;
        });
        var alertVM = {};

        if (alert) {
            alertVM = AddNewAlert(alertInfo, alert);
        }
        else {
            alertVM = AddNewAlert(alertInfo);
            self.Alerts.push(alertVM);
        }

        switch (alertVM.AlertType) {
            case AlertTypes.High:
                var highAlerts = ko.utils.arrayFilter(self.Alerts(), function (a) {
                    return a.AlertType == AlertTypes.High;
                });

                if (highAlerts.length > 1) {
                    self.Alerts.remove(function (model) {
                        return model.AlertType == AlertTypes.High && model.Id != alertVM.Id;
                    });
                }

                self.ShowHighAlert(true);
                self.ShowOtherAlerts(false);
                self.ShowOtherAlert(false);

                self.SwapHighAlertDetailsWithMapByInterval(alertVM);
                break;
            case AlertTypes.Medium:
                {
                    if (!self.ShowHighAlert()) {
                        self.ShowOtherAlerts(true);
                        self.ShowOtherAlert(false);
                        self.ActiveOtherAlert(alertVM);
                        showList();
                    }
                    break;
                }
            case AlertTypes.Low:
                {
                    if (!self.ShowHighAlert()) {
                        if (!self.ShowOtherAlerts()) {
                            self.ShowOtherAlert(true);
                        }
                        else {
                            showList();
                        }
                        self.ActiveOtherAlert(alertVM);
                    }
                    break;
                }
        }

        var duration = dateDiffInMilliSeconds(new Date(alertVM.ActivatedAt()), new Date());
        //var validDuration = dateDiffInMilliSeconds(new Date(alertVM.ActivatedAt()), endDate);
        var validDuration = dateDiffInMilliSeconds(new Date(alertVM.ActivatedAt()), new Date(alertVM.EndedAt()));

        if (alertVM.EndTimeoutPointer)
        {
            clearTimeout(alertVM.EndTimeoutPointer);
        }

        if (validDuration <= duration) {
            self.RemoveAlert(alertVM.Id);
            self.CallAlertExpiredFromSignalR(alertVM.Id);
        }
        else {
            var timeOut = (validDuration - duration);

            alertVM.EndTimeoutPointer = extendedTimeout(function () {
                self.RemoveAlert(alertVM.Id);
                self.CallAlertExpiredFromSignalR(alertVM.Id);
            }, timeOut);
        }
        alertVM.UpdateActiveDuration();
        initCorousel();
    }

    self.ShowActiveOtherAlert = function (alertModel) {
        SetActiveAlert(alertModel);
        self.ShowAlertDetails();
    };

    self.ShowAlertDetails = function () {
        showDetails();
        self.ShowAlertUpdateMaps()
    };

    self.ShowActiveOtherAlertByIndicator = function (alertModel) {
        SetActiveAlert(alertModel);
        self.ShowAlertUpdateMaps();
    };
    var interval = null;
    self.SwapHighAlertDetailsWithMapByInterval = function (alert) {
        if (alert.AlertType == AlertTypes.High) {
            if (alert.LocationQuickLink && alert.LocationQuickLink() && alert.LocationQuickLink().length > 0)
            {
                interval = window.setInterval(swapDetailsMap, 15000);
            }
            else
            {
                 clearInterval(interval);
            }
        }

    }

    function SetActiveAlert(alertModel) {
        var alert = ko.utils.arrayFirst(self.Alerts(), function (a) {
            return a.Id == alertModel.Id;
        });
        self.ActiveOtherAlert(alert);
    }

    self.ActiveOtherAlert = ko.observable();

    self.ActiveEventAlert = ko.observable();

    self.Events = ko.observableArray();

    self.ViewAllOtherAlerts = function (alertClicked) {
        var Alerts = ko.utils.arrayFilter(self.Alerts(), function (alert) {
            return alert.AlertType != AlertTypes.High && alert.AlertType != AlertTypes.Event;
        });

        var Alert = ko.utils.arrayFirst(Alerts, function (alert) {
            return alert.Id == alertClicked.Id;
        });

        if (Alert) {
            self.ActiveOtherAlert(Alert);
        }
        self.ShowOtherAlerts(true);
        self.ShowOtherAlert(false);
    }

    self.HideOtherAlerts = function () {
        self.ShowOtherAlerts(false);
        self.ShowOtherAlert(true);
        var length = self.OtherAlerts().length;
        if (length > 0) {
            self.ActiveOtherAlert(self.OtherAlerts()[length - 1]);
        }
    }

    self.HideDetailsOtherAlerts = function () {
        showList();
        self.HideOtherAlerts();
    }

    self.BottomAlertCorousel = ko.observable(new AlertCorouselViewModel());
    self.AlertsCorousel = ko.observable(new AlertCorouselViewModel());

    self.BottomAlertClass = function () {
        if (self.BottomAlertCorousel().CurrentAlert()) {
            var curAlert = self.BottomAlertCorousel().CurrentAlert().AlertType;
            switch (curAlert) {
                case AlertTypes.Medium: return 'lowAlertyellow';
                case AlertTypes.Event: return 'lowAlertEvent';
                default: return '';
            }
        }
        return '';
    };

    self.ClassMarginTopByTitleLength = function () {
        if (self.BottomAlertCorousel().CurrentAlert()) {
            var curAlertTitle = self.BottomAlertCorousel().CurrentAlert().Title();
            if(window.orientation == 'landscape')
            {
                return SetClassMargin_Landscape(curAlertTitle);
            }
            else
            {
                return SetClassMargin_Portrait(curAlertTitle);
            }
        }
        return '';
    };

    function SetClassMargin_Portrait(curAlertTitle)
    {
        // console.log('Portrait-'+ curAlertTitle.length);
        if (curAlertTitle.length < 35) {
            return 'marginTopByEventTitle-1Line';
        } else
            if (curAlertTitle.length > 70) {
                return 'marginTopByEventTitle-3Line';
            }
            else {
                return 'marginTopByEventTitle-2Line';
            }
    }

    function SetClassMargin_Landscape(curAlertTitle) {
        console.log('Landscape-' + curAlertTitle.length);
        if (curAlertTitle.length < 86) {
            return 'marginTopByEventTitle-1Line';
        } else
            if (curAlertTitle.length > 172) {
                return 'marginTopByEventTitle-3Line';
            }
            else {
                return 'marginTopByEventTitle-2Line';
            }
    }
    /*-----------------------------------------------SHOW ALERT--------------------------------------------*/

    self.loadActiveAlerts = function (alerts) {
        ko.utils.arrayForEach(alerts, function (alert) {
            self.ShowAlert(alert);
        });
    }

    self.CallAlertExpiredFromSignalR = function (alertId) {
        //check this method implementation in signalr.notification.js
        //This is dummy method and it is replaced by another method in signalr.notification.js
    };

    self.SetNextOtherAlert = function (activeAlert) {
        var Alerts = ko.utils.arrayFilter(self.Alerts(), function (alert) {
            return alert.AlertType != AlertTypes.High && alert.AlertType != AlertTypes.Event;
        });

        Alerts.sort(function (left, right) {
            if (AlertTypeOrder[left.AlertType] == AlertTypeOrder[right.AlertType]) {
                return left.ActivatedAt() == right.ActivatedAt() ? 0 : (left.ActivatedAt() > right.ActivatedAt() ? 1 : -1);
            }
            else {
                return (AlertTypeOrder[left.AlertType] > AlertTypeOrder[right.AlertType] ? 1 : -1);
            }
        });

        var index = 0;
        var Alert = ko.utils.arrayFirst(Alerts, function (alert) {
            if (alert.Id == activeAlert.Id) {
                return true;
            }
            else {
                index++;
                return false;
            }
        });

        if (Alert) {
            var reloadMap = false;

            if (Alerts.length <= index + 1) {
                if (self.ActiveOtherAlert().Id != Alerts[0].Id) {
                    self.ActiveOtherAlert(Alerts[0]);
                    reloadMap = true
                }
            }
            else {
                self.ActiveOtherAlert(Alerts[index + 1]);
                reloadMap = true;
            }

            if (reloadMap) {
                self.ShowAlertUpdateMaps();

            }
        }
    }

    self.SetPreviousOtherAlert = function (activeAlert) {
        var Alerts = ko.utils.arrayFilter(self.Alerts(), function (alert) {
            return alert.AlertType != AlertTypes.High && alert.AlertType != AlertTypes.Event;
        });

        Alerts.sort(function (left, right) {
            if (AlertTypeOrder[left.AlertType] == AlertTypeOrder[right.AlertType]) {
                return left.ActivatedAt() == right.ActivatedAt() ? 0 : (left.ActivatedAt() > right.ActivatedAt() ? 1 : -1);
            }
            else {
                return (AlertTypeOrder[left.AlertType] > AlertTypeOrder[right.AlertType] ? 1 : -1);
            }
        });

        var index = 0;
        var Alert = ko.utils.arrayFirst(Alerts, function (alert) {
            if (alert.Id == activeAlert.Id) {
                return true;
            }
            else {
                index++;
                return false;
            }
        });

        if (Alert) {
            var reloadMap = false;

            if (index == 0) {
                if (Alerts.length > 1) {
                    self.ActiveOtherAlert(Alerts[Alerts.length - 1]);
                    reloadMap = true;
                }
            }
            else {
                self.ActiveOtherAlert(Alerts[index - 1]);
                reloadMap = true;
            }

            if (reloadMap) {
                self.ShowAlertUpdateMaps();
            }
        }
    }

    function AddNewAlert(alertInfo, alertVM) {
        var vm = alertVM || new AlertViewModel();
        vm.Id = alertInfo.Id;
        vm.AlertType = alertInfo.AlertType;
        vm.Title(alertInfo.AlertTitle);
        vm.Message(alertInfo.AlertMessage);
        vm.ActivatedAt(alertInfo.DateActivated);
        vm.EndedAt(alertInfo.DateEnded);
        vm.LocationQuickLink(alertInfo.QuickLink);
        vm.AlertLocationId(alertInfo.AlertLocationId);



        vm.Updates([]);
        $.each(alertInfo.AlertUpdates, function (index, item) {
            var update = new AlertUpdateViewModel();
            update.Id = item.Id;
            update.PostedAt = item.CreatedAt;
            update.AlertId = item.AlertId;
            update.Comment(item.Comment);
            update.LocationQuickLink(item.LocationQuicklink);
            update.LocationAddress(item.LocationAddress);
            update.LocationDescription(item.LocationDescription);
            update.LocationAffectedRadius(item.LocationAffectedRadius);

            //addAlertUpdateMap(update, item.LocationQuicklink);

            vm.Updates.push(update);
            vm.Updates.sort(function (left, right) { return left.PostedAt == right.PostedAt ? 0 : (left.PostedAt > right.PostedAt ? -1 : 1) });
        });

        var alertUpdate = ko.utils.arrayFirst(vm.Updates(), function (update) {
            return !!update.LocationQuickLink();
        });

        if (alertUpdate)
        {
            vm.LocationQuickLink(alertUpdate.LocationQuickLink());
        }
        addAlertLocationMap(vm);
        return vm;
    }

    /*-----------------------------------------------HIDE ALERT---------------------------------------*/
    self.RemoveAlert = function (alertId) {

        var alert = ko.utils.arrayFirst(self.Alerts(), function (a) {
            return a.Id == alertId;
        });

        if (alert) {
            switch (alert.AlertType) {
                case AlertTypes.High:
                    var alerts = ko.utils.arrayFilter(self.Alerts(), function (a) {
                        return a.AlertType == AlertTypes.High;
                    });

                    if (alerts.length <= 1) {
                        self.ShowHighAlert(false);
                        if (self.OtherAlertsWithoutEvent().length >= 1) {
                            self.ShowOtherAlerts(false);
                            self.ShowOtherAlert(true);
                        }
                    }
                    break;
                case AlertTypes.Medium:
                case AlertTypes.Low:
                    if (self.OtherAlertsWithoutEvent().length <= 1) {
                        self.ShowOtherAlerts(false);
                        self.ShowOtherAlert(false);
                    }
                    else {
                        var medLowAlerts = ko.utils.arrayFilter(self.Alerts(), function (a) {
                            return (a.AlertType == AlertTypes.Medium || a.AlertType == AlertTypes.Low) && a.Id != alertId;
                        });
                        if (!self.ShowHighAlert()) {
                            if (!self.ShowOtherAlerts()) {
                                self.ShowOtherAlert(true);
                                self.ActiveOtherAlert(medLowAlerts[medLowAlerts.length - 1]);
                            }
                            else {
                                self.ActiveOtherAlert(medLowAlerts[medLowAlerts.length - 1]);
                                self.ShowOtherAlert(false);
                                showList();
                                //self.ActiveOtherAlert('');
                            }
                        }
                        else {
                            self.ActiveOtherAlert(medLowAlerts[medLowAlerts.length - 1]);
                        }
                    }
                    break;
            }
        }

        self.Alerts.remove(function (model) {
            return model.Id == alertId;
        });
        initCorousel();
    }

    /*------------------------------------------SHOW ALERTUPDATE--------------------------------------------------*/
    self.ShowAlertUpdate = function (alertUpdateInfo) {
        ProcessAlertUpdate(alertUpdateInfo);
    }

    function ProcessAlertUpdate(alertUpdateVM) {
        var alert = ko.utils.arrayFirst(self.Alerts(), function (a) {
            return a.Id == alertUpdateVM.AlertId;
        });

        if (alert && alert.Updates && alert.Updates()) {
            var alertUpdates = alert.Updates();
            var alertUpdate = ko.utils.arrayFirst(alertUpdates, function (au) {
                return au.Id == alertUpdateVM.Id;
            });

            if (alertUpdate) {
                var quickLink = alertUpdateVM.LocationQuicklink;

                alertUpdate.PostedAt = alertUpdateVM.CreatedAt;
                alertUpdate.AlertId = alertUpdateVM.AlertId;
                alertUpdate.Comment(alertUpdateVM.Comment);
                alertUpdate.LocationQuickLink(quickLink);
                alertUpdate.LocationAddress(alertUpdateVM.LocationAddress);
                alertUpdate.LocationDescription(alertUpdateVM.LocationDescription);
                alertUpdate.LocationAffectedRadius(alertUpdateVM.LocationAffectedRadius);

                if (alertUpdate.LocationQuickLink && alertUpdate.LocationQuickLink())
                {
                    alert.LocationQuickLink(alertUpdate.LocationQuickLink());
                    addAlertLocationMap(alert);
                }
                else
                {
                    alert.LocationQuickLink(alertUpdate.LocationQuickLink());
                    swapDetailsMap();
                }
                //addAlertUpdateMap(alertUpdate, quickLink);


            }
            else {
                var update = new AlertUpdateViewModel();
                var quickLink = alertUpdateVM.LocationQuicklink;

                update.Id = alertUpdateVM.Id;
                update.AlertId = alertUpdateVM.AlertId;
                update.PostedAt = alertUpdateVM.CreatedAt;
                update.Comment(alertUpdateVM.Comment);
                update.LocationQuickLink(quickLink);
                update.LocationAddress(alertUpdateVM.LocationAddress);
                update.LocationDescription(alertUpdateVM.LocationDescription);
                update.LocationAffectedRadius(alertUpdateVM.LocationAffectedRadius);
                alert.Updates.push(update);
                alert.Updates.sort(function (left, right) { return left.PostedAt == right.PostedAt ? 0 : (left.PostedAt > right.PostedAt ? -1 : 1) });


                //addAlertUpdateMap(update, quickLink);
                var alertUpdate = ko.utils.arrayFirst(alert.Updates(), function (update) {
                    return !!update.LocationQuickLink();
                });

                if (alertUpdate) {
                    alert.LocationQuickLink(alertUpdate.LocationQuickLink());
                    addAlertLocationMap(alert);
                }
            }
            self.SwapHighAlertDetailsWithMapByInterval(alert);
        }
    }

    self.ShowAlertUpdateMaps = function () {
        var alert = self.ActiveOtherAlert();
        if (alert && alert.Updates && alert.Updates()) {
            var alertUpdates = alert.Updates();
            //ko.utils.arrayForEach(alertUpdates, function (update) {
            //    if (update.LocationQuickLink()) {
            //        addAlertUpdateMap(update, update.LocationQuickLink());
            //    }
            //});

            var alertUpdate = ko.utils.arrayFirst(alert.Updates(), function (update) {
                return !!update.LocationQuickLink();
            });

            if (alertUpdate) {
                alert.LocationQuickLink(alertUpdate.LocationQuickLink());
            }
        }

        addAlertLocationMap(alert);
    }

    //function addAlertUpdateMap(alertUpdate, quickLink) {
    //    if (PORTAL_PARAMETERS_LOADED && quickLink) {
    //        var svgMap = new SvgMap(mainVM.ClientVM.clientID(), 'mapbox-' + alertUpdate.Id);
    //        alertUpdate.Map(svgMap);
    //        svgMap.Init(quickLink, quickLink, false);
    //    }
    //}

    function addAlertLocationMap(alert)
    {
        if (PORTAL_PARAMETERS_LOADED && alert && alert.LocationQuickLink() && alert.AlertLocationId()) {
            var svgMap = new SvgMap(mainVM.ClientVM.clientID(), 'mapbox-' + alert.AlertLocationId());
            alert.Map(svgMap);
            svgMap.Init(alert.LocationQuickLink(), alert.LocationQuickLink(), false);
        }
    }

    /*---------------------------------------------HIDE ALERTUPDATE----------------------------------------------*/
    self.HideStatusAlertUpdate = function (alertUpdateInfo) {
        var alert = ko.utils.arrayFirst(self.Alerts(), function (a) {
            return a.Id == alertUpdateInfo.AlertId;
        });

        if (alert && alert.Updates && alert.Updates()) {
            alert.Updates.remove(function (model) {
                return model.Id == alertUpdateInfo.Id;
            });
        }
    }

    /*------------------------------------------SHOW ALERT Event--------------------------------------------------*/
    self.GetTodayEvents = function (jsonEvent) {
        if (jsonEvent && jsonEvent.length > 0) {
            var eventId = 1000000;
            ko.utils.arrayForEach(jsonEvent, function (event) {
                eventId++;
                var alertEvent = MapEventToAlertModel(event, eventId);
                var eventModel = MapEventToEventModel(event, eventId);
                self.Events.push(eventModel);
                self.Alerts.push(alertEvent);
                var duration = dateDiffInMilliSeconds(new Date(), dateStringToDate(event.EndTime));

                if (duration > 0) {
                    extendedTimeout(function () {
                        self.RemoveAlert(alertEvent.Id);
                    }, duration);
                }
                else {
                    self.RemoveAlert(eventId);
                }
            });

            if (!self.ShowHighAlert() && !self.ShowOtherAlerts() && self.OtherAlertsWithoutEvent() && self.OtherAlertsWithoutEvent().length > 0) {
                self.ShowOtherAlert(true);
            }
            initCorousel();
        }

    }

    function MapEventToEventModel(event, eventId) {
        var eventModel = new EventViewModel();
        eventModel.Id = eventId;
        eventModel.Title(event.Title);
        eventModel.Description(event.Description);
        eventModel.QuickLink(event.QuickLink);
        eventModel.TimeRange(event.TimeRange);
        eventModel.StartTime(event.StartTime);
        eventModel.EndTime(event.EndTime);
        return eventModel;
    }
    function MapEventToAlertModel(event, eventId) {
        var vm = new AlertViewModel();
        vm.Id = eventId;
        vm.AlertType = AlertTypes.Event;
        vm.Title(event.Title);
        vm.Message(event.Description);
        vm.ActivatedAt(event.StartTime);
        vm.EndedAt(event.EndTime);
        vm.EventDuration(event.TimeRange);
        return vm;
    }

    function showEventModal() {
        $('#DirectionsCrawlerPopup').modal({
            show: true, keyboard: false, backdrop: 'static'
        });
    }

    function hideEventModal() {
        $('#DirectionsCrawlerPopup').modal("hide");
    }

    self.showEventDetails = function (event) {
        var activeEvent = ko.utils.arrayFirst(self.Events(), function (evt) {
            return event.Id == evt.Id;
        });
        self.ActiveEventAlert(ko.toJS(activeEvent));
        showEventModal();
    }

    initCorousel = function () {

        if (!self.BottomAlertCorousel().Duration()) {
            self.BottomAlertCorousel().Duration(5);
        }

        if (!self.AlertsCorousel().Duration()) {
            self.AlertsCorousel().Duration(5);
        }

        self.BottomAlertCorousel().Alerts(self.OtherAlerts());
        self.AlertsCorousel().Alerts(self.OtherAlertsWithoutEvent());

        if (self.ShowHighAlert()) {
            self.BottomAlertCorousel().Status(false);
            self.AlertsCorousel().Status(false);

        }
        else if (self.ShowOtherAlerts()) {
            self.AlertsCorousel().Status(true);
            self.BottomAlertCorousel().Status(false);
        }
        else if (self.ShowOtherAlert()) {
            self.BottomAlertCorousel().Status(true);
            self.AlertsCorousel().Status(false);
        }
        else if (self.OtherAlertsWithoutEvent().length <= 0 && self.OtherAlerts().length > 0) {
            self.ShowOtherAlert(true);
            self.BottomAlertCorousel().Status(true);
            self.AlertsCorousel().Status(false);
        }
    }

    var mthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    self.formatDate = function (dt) {
        var date = new Date(dt);
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime + "  -  " + mthNames[date.getMonth()] + "  " + date.getDate() + ", " + date.getFullYear();
    }
}

(function () {
    //var alertModal = new AlertModal();
    //ko.applyBindings(alertModal, document.getElementById('all-alerts'));
}());
//-----------------------------End------------------------------//


$(document).ready(function () {
    //--------------------Alert Notifition UI JS--------------------//
    //----------------------------Start-----------------------------//
    (function () {
        //--------------Start : High level alert--------------//

        window.swapDetailsMap = function () {
            if ($('.highAlertalertMap').hasClass('highAlertmapHidden')) {
                $('.highAlertalertMap').removeClass('highAlertmapHidden');
                $('.highAlertalertMap').addClass('highAlertshowMap');
                $('.highAlertalertDetails').addClass('highAlerthideDetails');
            }
            else if ($('.highAlertalertMap').hasClass('highAlertshowMap')) {
                $('.highAlertalertMap').removeClass('highAlertshowMap');
                $('.highAlertalertMap').addClass('highAlerthideMap');
                $('.highAlertalertDetails').removeClass('highAlerthideDetails');
                $('.highAlertalertDetails').addClass('highAlertshowDetails');
            }
            else if ($('.highAlertalertMap').hasClass('highAlerthideMap')) {
                $('.highAlertalertMap').removeClass('highAlerthideMap');
                $('.highAlertalertMap').addClass('highAlertshowMap');
                $('.highAlertalertDetails').removeClass('highAlertshowDetails');
                $('.highAlertalertDetails').addClass('highAlerthideDetails');
            }
        }

        window.setInterval(emergencyBlink, 1000);

        function emergencyBlink() {
            if ($('#highAlertemergencyFrame').hasClass('highAlertframeWhite')) {
                $('#highAlertemergencyFrame').removeClass('highAlertframeWhite');
                $('#highAlertemergencyFrame').addClass('highAlertframeRed');
            }
            else {
                $('#highAlertemergencyFrame').removeClass('highAlertframeRed');
                $('#highAlertemergencyFrame').addClass('highAlertframeWhite');
            }
        }
        //--------------End : High level alert--------------//


        //--------------Start : Mid level alert--------------//

        showDetails = function () {
            // function showDetails() {
            $('#midAlertlistView').removeClass('midAlertshowList');
            $('#midAlertlistView').addClass('midAlerthideList');
            $('#midAlertdetailsView').removeClass('midAlerthideDetails');
            $('#midAlertdetailsView').addClass('midAlertshowDetails');
        }
        //
        showList = function () {
            // function showList() {
            $('#midAlertlistView').removeClass('midAlerthideList');
            $('#midAlertlistView').addClass('midAlertshowList');
            $('#midAlertdetailsView').removeClass('midAlertshowDetails');
            $('#midAlertdetailsView').addClass('midAlerthideDetails');
        }
        //--------------End : Mid level alert--------------//

        //--------------Start : Low level alert--------------//

        /*
        window.setInterval(incrementAlert, 15000);

        function incrementAlert() {
            $('.lowAlertalertTitle').addClass('lowAlerttransitionOut');
            $('.lowAlertalertDescription').addClass('lowAlerttransitionOut');
            $('.lowAlertalertDurationContainer p').addClass('lowAlerttransitionOut');


            Swap alert data//

            After swap is complete//
            $('.alertTitle').addClass('transitionIn');
            $('.alertDescription').addClass('transitionIn');
            $('.alertDurationContainer p').addClass('transitionIn');


            Swap alert type css//

                if (alert is mid-level){
                    $('.container').addClass('yellow');
                }
                else{
                    $('.container').removeClass('yellow');
                }

        }*/
        //--------------End : Low level alert--------------//

    }());
    //-----------------------------End------------------------------//

});