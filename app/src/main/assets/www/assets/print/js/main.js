var COMMONBLOB = "http://blob.yourdirectroute.com/wayfinder-common/";
//var COMMONBLOB = "http://localhost:62960/WebBasedKiosk/wayfindercommon/";
var MAPSVG = null;
var CANCELPOPOVER = false;
var ALLOWREPORTING = true;


var JKEYBOARD = '';
var PORTAL_PARAMETERS_LOADED = false;
var MAP_NAME_FOUND = false;
var BACKGROUND_MAP_LOADED = false;
var QUICKLINK_FOUND = false;
var QUICKLINK_DATA_LOADED = false;
var MAPHASPATH = false;
var mainVM = null;
var snd = new Audio("sounds/sound_1.mp3");
function PlayClickSound(e) {
    if (e && e.target) {
        if (!$(e.target).hasClass('clickSound') && !$(e.target).hasClass('clickable'))
            return;
    }
    //snd.currentTime = 0;
    snd.load();
    snd.play();
}


if (typeof MSGesture != "undefined") {
    var redGesture;
    var redElement;
    function prepareTarget(targetId, eventListener) {
        var target = document.getElementById(targetId);
        target.addEventListener("MSGestureStart", eventListener, false);
        target.addEventListener("MSGestureEnd", eventListener, false);
        target.addEventListener("MSGestureChange", eventListener, false);
        target.addEventListener("MSInertiaStart", eventListener, false);
        target.addEventListener("MSGestureTap", eventListener, false);
        target.addEventListener("MSGestureHold", eventListener, false);
        target.addEventListener("pointerdown", eventListener, false);
    }
    var InitGestureHandler = function () {
        // You need to first register to MSPointerDown to be able to
        // have access to more complex Gesture events
        prepareTarget("SVGBox", manipulateElement);
        // Create MSGesture object 1 (red <div>)
        redGesture = new MSGesture();
        redElement = document.getElementById("SVGBox");
        redGesture.target = redElement;

    }

    var manipulateElement = function (e) {
        //throw new EventException;
        //Can also add timestamps here to allow the code to run only every so milliseconds
        if (e.type == "pointerdown")  // add pointer on pointerdown event
        {
            redGesture.addPointer(e.pointerId);
            return;
        }
        if (e.scale >= 1.03) {
            SVGZoomIn();
        }
        else if (e.scale <= 0.97) {
            SVGZoomOut();
        }
        printEvent(e);
    }

    function printEvent(evt) {
        var str =
            formatMessage(evt.type, 16) +
            formatMessage(evt.screenX, 6) +
            formatMessage(evt.screenY, 6) +
            formatMessage(evt.clientX ? evt.clientX.toFixed(0) : 0, 6) +
            formatMessage(evt.clientY ? evt.clientY.toFixed(0) : 0, 6) +
            formatMessage(evt.translationX ? evt.translationX.toFixed(2) : 0, 8) +
            formatMessage(evt.translationY ? evt.translationY.toFixed(2) : 0, 8) +
            formatMessage(evt.scale ? evt.scale.toFixed(2) : 0, 7) +
            formatMessage(evt.rotation ? evt.rotation.toFixed(2) : 0, 7) +
            formatMessage(evt.detail, 5) +
            formatMessage(evt.currentTarget ? evt.currentTarget.id : 0, 10) +
            formatMessage(evt.srcElement ? evt.srcElement.id : 0, 10) +
            "\n";
        console.log(str);
        evt.stopPropagation();
    }
    function formatMessage(str, len) {
        var formattedMessage = null;
        if (str != null) {
            var formattedMessage = str.toString();
            formattedMessage += " ";
            for (var idx = formattedMessage.length; idx < len; idx++) {
                formattedMessage += " ";
            }
        }
        return formattedMessage;
    }
}

$(function () {
    if (typeof InitGestureHandler != "undefined") InitGestureHandler();
    if (typeof StartKeyboard != "undefined") StartKeyboard();
    //$("#datepicker").datepicker();
    $('#jKeyboard').hide();
    mainVM = new MainViewModel();
    OnlineStatusCheck(function (online) {
        mainVM.IsOnline(online);
        if (!online) {
            if (mainVM.ClientVM.logoNormal.indexOf("data:image") < 0) {
                GetDataURL(mainVM.ClientVM.logoNormal, function (url) {
                    if (url) {
                        mainVM.ClientVM.logoNormal = url;
                        mainVM.ClientVM.setLogoImage();
                    }
                });
            }
            if (mainVM.ClientVM.logoSmall.indexOf("data:image") < 0) {
                GetDataURL(mainVM.ClientVM.logoSmall, function (url) {
                    if (url) {
                        mainVM.ClientVM.logoSmall = url;
                        mainVM.ClientVM.setLogoImage();
                    }
                });
            }
            if (mainVM.ClientVM.FirstAdImage().indexOf("data:image") < 0) {
                GetDataURL(mainVM.ClientVM.FirstAdImage(), function (url) {
                    if (url) {
                        mainVM.ClientVM.FirstAdImage(url);
                    }
                });
            }
            if (mainVM.ClientVM.SecondAdImage().indexOf("data:image") < 0) {
                GetDataURL(mainVM.ClientVM.SecondAdImage(), function (url) {
                    if (url) {
                        mainVM.ClientVM.SecondAdImage(url);
                    }
                });
            }
            if (mainVM.ClientVM.ThirdAdImage().indexOf("data:image") < 0) {
                GetDataURL(mainVM.ClientVM.ThirdAdImage(), function (url) {
                    if (url) {
                        mainVM.ClientVM.ThirdAdImage(url);
                    }
                });
            }
            if (mainVM.ClientVM.FirstAdMobile().indexOf("data:image") < 0) {
                GetDataURL(mainVM.ClientVM.FirstAdMobile(), function (url) {
                    if (url) {
                        mainVM.ClientVM.FirstAdMobile(url);
                    }
                });
            }
            if (mainVM.ClientVM.SecondAdMobile().indexOf("data:image") < 0) {
                GetDataURL(mainVM.ClientVM.SecondAdMobile(), function (url) {
                    if (url) {
                        mainVM.ClientVM.SecondAdMobile(url);
                    }
                });
            }
            if (mainVM.ClientVM.ThirdAdMobile().indexOf("data:image") < 0) {
                GetDataURL(mainVM.ClientVM.ThirdAdMobile(), function (url) {
                    if (url) {
                        mainVM.ClientVM.ThirdAdMobile(url);
                    }
                });
            }
        }
    });
    mainVM.CurrentEventDate(new Date());
    ko.applyBindings(mainVM, document.getElementById("mainBody"));
    mainVM.ClientVM.LoadPortalParameters(function () { PORTAL_PARAMETERS_LOADED = true; });
    mainVM.GetQuicklinkData();
    mainVM.GetFloorList();
    mainVM.GetTopDestinations();
    mainVM.PopulateLookup();
    //mainVM.GetEvents(new Date);
    mainVM.TodaysEvents();
    mainVM.GetTodayActiveEvents();
    $('.clickSound').on('click', PlayClickSound);
    $('#datepicker').datepicker({
        onSelect: function (dateText) {
            PlayClickSound();
            mainVM.GetEvents(new Date($('#datepicker').val()));
        }
    });

    //.on('changeDate', function (ev) {
    //mainVM.GetEvents(ev);
    //});
    $('#searchFieldTo').on('focus', function () {
        if (navigator.userAgent.match(/iPhone|iPad|iPod/i) ||
            navigator.userAgent.match(/Android/i))
            return false;
        JKEYBOARD = 'search';
        $('#jKeyboard').show();
        return false;
    });
    $('#emailInput').on('focus', function () {
        if (navigator.userAgent.match(/iPhone|iPad|iPod/i) ||
            navigator.userAgent.match(/Android/i))
            return false;
        JKEYBOARD = 'email';
        $('#jKeyboard').show();
        return false;
    });
    $('#mainBody').on('touchstart', function () {
        mainVM.LastUserInteraction = new Date().getTime();
        if (mainVM.IsBaseState()) {
            mainVM.SendReporting('MAINMENU', 'USERSESSIONSTART', 'Start', "");
        } else {
            mainVM.IsBaseState(false);
        }
    });
    $('#mainBody').on('mousedown', function () {
        mainVM.LastUserInteraction = new Date().getTime();
        if (mainVM.IsBaseState()) {
            mainVM.SendReporting('MAINMENU', 'USERSESSIONSTART', 'Start', "");
        } else {
            mainVM.IsBaseState(false);
        }
    });

    setupPopover();
    setTimeout(showPopover, 15000);
    setTimeout(checkInteraction, 10000);
    $('#lookupButton').on('click', function () {
        $('.dataListInner').hide();
        $('.lookupInner').show();
        mainVM.lookupBreadcrumb.push(0);
        if ($('#navSlideout').hasClass('extra')) {
            $('.slideout').removeClass('extra');
        } else {
            $('.slideout').addClass('extra');
        }
        return false;
    });
    $('#navSlideout').on('click', function (e) {
        if (!$(e.target).hasClass('clickable'))
            return;
        $('.slideout').removeClass('extra');
        if ($('#navSlideout').hasClass('out')) {
            $('.slideout').removeClass('out');
            $('.slideout').removeClass('tab');
            $('.hiddenObject').removeClass('hide');
            $('.quickButton').removeClass('buttonOut');
            $('.iconSwitchOut').removeClass('tabIconsOut');
            $('.buttonContainer').removeClass('buttonContainerOut');
			$('#QRcode').addClass('hide');
            $('.menuButton').addClass('hide');
            $('#directionsSlideout').removeClass('directionTabHide');
            $('.directionsSlideout').addClass('hide');
			$('.avatarVideoLarge').removeClass('avatarVideoLargeNavOut');
            $('#rightContainer').removeClass('mainRightSlideContainerOut');
            $('#rightContainer').removeClass('mainRightSlideContainerOutRight');
            $('.fullpage, .MapNavBar').removeClass('rightOut');
            $('.fullpage, .MapNavBar').addClass('rightTabs');
            $('.fullpage, .MapNavBar').removeClass('leftOut');
			 $('.callIcon').removeClass('callIconOut');
            $('.liveConnectStyle').removeClass('liveConnectStyleOut');
            $('#mapControlBtns').addClass('mapControlBtnsSetPosition');
            if ($('.MapNavBar').hasClass('NavBarVisible')) {
                $('#mapControlBtns').addClass('mapControlBtnKeepTop');
                $('#mapControlBtns').removeClass('mapControlBtnKeepBottom');
            }
            else {
                $('#mapControlBtns').addClass('mapControlBtnKeepBottom');
                $('#mapControlBtns').removeClass('mapControlBtnKeepTop');
            }
            $('#mapControlBtns').removeClass('mapControlBtnsSwitchPosition mapControlBtnsRightOpenPosition');
            CANCELPOPOVER = false;
            hidePopover();
        } else {
            CANCELPOPOVER = true;
            hidePopover();
            $('.slideout').removeClass('out');
            $('.slideout').addClass('tab');
            $('#navSlideout').addClass('out');
            $('.hiddenObject').addClass('hide');
            $('.quickButton').addClass('buttonOut');
            $('.iconSwitchOut').addClass('tabIconsOut');
            $('.buttonContainer').addClass('buttonContainerOut');
			$('#QRcode').addClass('hide');
            $('.menuButton').removeClass('hide');
            $('#directionsSlideout').removeClass('directionTabHide');
            $('.directionsSlideout').removeClass('hide');
			$('.avatarVideoLarge').removeClass('avatarVideoLargeDirectionsOut');
			$('.avatarVideoLarge').addClass('avatarVideoLargeNavOut');
            $('#rightContainer').addClass('mainRightSlideContainerOut');
            $('#rightContainer').removeClass('mainRightSlideContainerOutRight');
            $('.fullpage, .MapNavBar').addClass('rightOut');
            $('.fullpage, .MapNavBar').removeClass('rightTabs');
            $('.fullpage, .MapNavBar').removeClass('leftOut');
			 $('.callIcon').addClass('callIconOut');
            $('.liveConnectStyle').addClass('liveConnectStyleOut');
            $('#mapControlBtns').removeClass('mapControlBtnsSwitchPosition mapControlBtnsSetPosition');
            if ($('.MapNavBar').hasClass('NavBarVisible')) {
                $('#mapControlBtns').addClass('mapControlBtnKeepTop');
                $('#mapControlBtns').removeClass('mapControlBtnKeepBottom');
            }
            else {
                $('#mapControlBtns').addClass('mapControlBtnKeepBottom');
                $('#mapControlBtns').removeClass('mapControlBtnKeepTop');
            }
            $('#mapControlBtns').addClass('mapControlBtnsRightOpenPosition');
        }
        mainVM.CenterMap();
        if (mainVM.IsBaseState()) {
            mainVM.SendReporting('MAINMENU', 'BUTTONCLICK', 'Navigation', "");
        }
        mainVM.IsBaseState(false);
    });
    $('#eventSlideout').on('click', function (e) {
        if (!$(e.target).hasClass('clickable'))
            return;
        $('.slideout').removeClass('extra');
        if ($('#eventSlideout').hasClass('out')) {
            $('.slideout').removeClass('out');
            $('.slideout').removeClass('tab');
            $('.hiddenObject').removeClass('hide');
            $('.quickButton').removeClass('buttonOut');
            $('.iconSwitchOut').removeClass('tabIconsOut');
            $('.buttonContainer').removeClass('buttonContainerOut');
			$('#QRcode').removeClass('hide');
            $('.menuButton').addClass('hide');
            $('#directionsSlideout').removeClass('directionTabHide');
            $('.directionsSlideout').addClass('hide');
			$('.avatarVideoLarge').removeClass('avatarVideoLargeNavOut');
            $('#rightContainer').removeClass('mainRightSlideContainerOut');
            $('#rightContainer').removeClass('mainRightSlideContainerOutRight');
            $('.fullpage, .MapNavBar').removeClass('rightOut');
            $('.fullpage, .MapNavBar').addClass('rightTabs');
            $('.fullpage, .MapNavBar').removeClass('leftOut');
            $('#mapControlBtns').addClass('mapControlBtnsSetPosition');
            $('.callIcon').removeClass('callIconOut');
            $('.liveConnectStyle').removeClass('liveConnectStyleOut');
            if ($('.MapNavBar').hasClass('NavBarVisible')) {
                $('#mapControlBtns').addClass('mapControlBtnKeepTop');
                $('#mapControlBtns').removeClass('mapControlBtnKeepBottom');
            }
            else {
                $('#mapControlBtns').addClass('mapControlBtnKeepBottom');
                $('#mapControlBtns').removeClass('mapControlBtnKeepTop');
            }
            $('#mapControlBtns').removeClass('mapControlBtnsSwitchPosition mapControlBtnsRightOpenPosition');
        } else {
            $('.slideout').removeClass('out');
            $('.slideout').addClass('tab');
            $('#eventSlideout').addClass('out');
            $('.hiddenObject').addClass('hide');
            $('.quickButton').addClass('buttonOut');
            $('.iconSwitchOut').addClass('tabIconsOut');
            $('.buttonContainer').addClass('buttonContainerOut');
			$('#QRcode').addClass('hide');
            $('.menuButton').removeClass('hide');
            $('#directionsSlideout').removeClass('directionTabHide');
            $('.directionsSlideout').removeClass('hide');
			$('.avatarVideoLarge').removeClass('avatarVideoLargeDirectionsOut');
			$('.avatarVideoLarge').addClass('avatarVideoLargeNavOut');
            $('#rightContainer').addClass('mainRightSlideContainerOut');
            $('#rightContainer').removeClass('mainRightSlideContainerOutRight');
            $('.fullpage, .MapNavBar').addClass('rightOut');
            $('.fullpage, .MapNavBar').removeClass('rightTabs');
            $('.fullpage, .MapNavBar').removeClass('leftOut');
            $('.callIcon').addClass('callIconOut');
            $('.liveConnectStyle').addClass('liveConnectStyleOut');
            $('#mapControlBtns').removeClass('mapControlBtnsSwitchPosition mapControlBtnsSetPosition');
            if ($('.MapNavBar').hasClass('NavBarVisible')) {
                $('#mapControlBtns').addClass('mapControlBtnKeepTop');
                $('#mapControlBtns').removeClass('mapControlBtnKeepBottom');
            }
            else {
                $('#mapControlBtns').addClass('mapControlBtnKeepBottom');
                $('#mapControlBtns').removeClass('mapControlBtnKeepTop');
            }
            $('#mapControlBtns').addClass('mapControlBtnsRightOpenPosition');
        }
        mainVM.CenterMap();
        if (mainVM.IsBaseState()) {
            mainVM.SendReporting('MAINMENU', 'BUTTONCLICK', 'Events', "");
        }
        mainVM.IsBaseState(false);
    });
    $('#legendSlideout').on('click', function (e) {
        if (!$(e.target).hasClass('clickable'))
            return;
        $('.slideout').removeClass('extra');
        if ($('#legendSlideout').hasClass('out')) {
            $('.slideout').removeClass('out');
            $('.slideout').removeClass('tab');
            $('.hiddenObject').removeClass('hide');
            $('.quickButton').removeClass('buttonOut');
            $('.iconSwitchOut').removeClass('tabIconsOut');
            $('.buttonContainer').removeClass('buttonContainerOut');
			$('#QRcode').removeClass('hide');
            $('.menuButton').addClass('hide');
            $('#directionsSlideout').removeClass('directionTabHide');
			$('.avatarVideoLarge').removeClass('avatarVideoLargeNavOut');
            $('#rightContainer').removeClass('mainRightSlideContainerOut');
            $('#rightContainer').removeClass('mainRightSlideContainerOutRight');
            $('.fullpage, .MapNavBar').removeClass('rightOut');
            $('.fullpage, .MapNavBar').addClass('rightTabs');
            $('.fullpage, .MapNavBar').removeClass('leftOut');
            $('.callIcon').removeClass('callIconOut');
            $('.liveConnectStyle').removeClass('liveConnectStyleOut');
            $('#mapControlBtns').addClass('mapControlBtnsSetPosition');
            if ($('.MapNavBar').hasClass('NavBarVisible')) {
                $('#mapControlBtns').addClass('mapControlBtnKeepTop');
                $('#mapControlBtns').removeClass('mapControlBtnKeepBottom');
            }
            else {
                $('#mapControlBtns').addClass('mapControlBtnKeepBottom');
                $('#mapControlBtns').removeClass('mapControlBtnKeepTop');
            }
            $('#mapControlBtns').removeClass('mapControlBtnsSwitchPosition mapControlBtnsRightOpenPosition');
        } else {
            $('.slideout').addClass('tab');
            $('.slideout').removeClass('out');
            $('#legendSlideout').addClass('out');
            $('.hiddenObject').addClass('hide');
            $('.quickButton').addClass('buttonOut');
            $('.iconSwitchOut').addClass('tabIconsOut');
            $('.buttonContainer').addClass('buttonContainerOut');
			$('#QRcode').addClass('hide');
            $('.menuButton').removeClass('hide');
            $('#directionsSlideout').removeClass('directionTabHide');
			$('.avatarVideoLarge').addClass('avatarVideoLargeNavOut');
			$('.avatarVideoLarge').removeClass('avatarVideoLargeDirectionsOut');
            $('#rightContainer').addClass('mainRightSlideContainerOut');
            $('#rightContainer').removeClass('mainRightSlideContainerOutRight');
            $('.fullpage, .MapNavBar').addClass('rightOut');
            $('.fullpage, .MapNavBar').removeClass('rightTabs');
            $('.fullpage, .MapNavBar').removeClass('leftOut');
             $('.callIcon').addClass('callIconOut');
            $('.liveConnectStyle').addClass('liveConnectStyleOut');
            $('#mapControlBtns').removeClass('mapControlBtnsSetPosition mapControlBtnsSwitchPosition');
            if ($('.MapNavBar').hasClass('NavBarVisible')) {
                $('#mapControlBtns').addClass('mapControlBtnKeepTop');
                $('#mapControlBtns').removeClass('mapControlBtnKeepBottom');
            }
            else {
                $('#mapControlBtns').addClass('mapControlBtnKeepBottom');
                $('#mapControlBtns').removeClass('mapControlBtnKeepTop');
            }
            $('#mapControlBtns').addClass('mapControlBtnsRightOpenPosition');
        }
        mainVM.CenterMap();
        if (mainVM.IsBaseState()) {
            mainVM.SendReporting('MAINMENU', 'BUTTONCLICK', 'Legend', "");
        }
        mainVM.IsBaseState(false);
    });
    $('#directionsSlideout').on('click', function (e) {
        if (!$(e.target).hasClass('clickable'))
            return;
        $('.slideout').removeClass('extra');
        if ($('#directionsSlideout').hasClass('out')) {
            HideDirections();
        } else {
            ShowDirections();
        }
        mainVM.CenterMap();
        mainVM.IsBaseState(false);
    });
    $('#TimeoutModal').on('hidden.bs.modal', function () {
        setTimeout(checkInteraction, 10000);
    });
    $('.homeButton').on('click', function () {
        mainVM.currentLookupVM(mainVM.lookupVM);
        mainVM.lookupBreadcrumb([]);
        $('.dataListInner').hide();
        $('.lookupInner').hide();
        if ($('#navSlideout').hasClass('extra')) {
            $('.slideout').removeClass('extra');
        }
    });
    $('.menuButton').on('click', function () {
        $('.slideout').removeClass('out');
        $('#rightContainer').removeClass('mainRightSlideContainerOut');
        $('#rightContainer').removeClass('mainRightSlideContainerOutRight');
        $('.hiddenObject').removeClass('hide');
        $('.quickButton').removeClass('buttonOut');
        $('.iconSwitchOut').removeClass('tabIconsOut');
        $('.buttonContainer').removeClass('buttonContainerOut');
		$('#QRcode').addClass('hide');
        $('.menuButton').addClass('hide');
        $('.slideout').removeClass('tab');
		$('.avatarVideoLarge').removeClass('avatarVideoLargeDirectionsOut');
		$('.avatarVideoLarge').removeClass('avatarVideoLargeNavOut');
        $('.fullpage, .MapNavBar').removeClass('rightOut');
        $('.fullpage, .MapNavBar').addClass('rightTabs');
        $('.fullpage, .MapNavBar').removeClass('leftOut');
        $('.callIcon').removeClass('callIconOut');
        $('.liveConnectStyle').removeClass('liveConnectStyleOut');
        $('#directionsSlideout').removeClass('directionTabHide');
        $('#mapControlBtns').addClass('mapControlBtnsSetPosition');
        if ($('.MapNavBar').hasClass('NavBarVisible')) {
            $('#mapControlBtns').addClass('mapControlBtnKeepTop');
            $('#mapControlBtns').removeClass('mapControlBtnKeepBottom');
        }
        else {
            $('#mapControlBtns').addClass('mapControlBtnKeepBottom');
            $('#mapControlBtns').removeClass('mapControlBtnKeepTop');
        }
        $('#mapControlBtns').removeClass('mapControlBtnsRightOpenPosition mapControlBtnsSwitchPosition');
        CANCELPOPOVER = false;
        hidePopover();
        mainVM.CenterMap();
    });
    $('.menuButtonDirection').on('click', function () {
        HideDirections();
    });

    if (window.external && ('DocumentLoadCompleted' in window.external)) window.external.DocumentLoadCompleted();

});

function showPopover() {
    if (!CANCELPOPOVER) {
        $('#navSlideout').popover('show');
        setTimeout(hidePopover, 15000);
    }
}

function hidePopover() {
    $('#navSlideout').popover('hide');
    if (!CANCELPOPOVER) {
        setTimeout(showPopover, 15000);
    }
}

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

function escapeJSON(jsonString) {
    // This only replaces new lines. Add more escapes here
    return jsonString.replace(/\r?\n/g, "");
}


function checkInteraction() {
    //if (mainVM.IsBaseState() == false && mainVM.GettingDirections == false && new Date().getTime() - mainVM.LastUserInteraction > 30000)
    if (mainVM.IsBaseState() == false && mainVM.GettingDirections == false && new Date().getTime() - mainVM.LastUserInteraction > mainVM.ClientVM.kioskTimeout()) {// && !($('#EmailModal').data('bs.modal') && $('#EmailModal').data('bs.modal').isShown)) {
        $('#TimeoutModal').modal('show');
     mainVM.CountdownTimer(5);
	 setTimeout(mainVM.CountDown, 1000);
    } else {
    setTimeout(checkInteraction, 10000);
    }
}

function CancelReload() {
    mainVM.CountdownTimer(-1);
 // setTimeout(checkInteraction, 10000);
}

function Reload() {
    window.location.reload();
    //window.location.href = "";
    //var playVideoParam = getParameterByName(window.location.href, "avatarplay");
    //if (playVideoParam)
    //{
    //    window.location.reload();
    //}
    //else
    //{
    //    window.location.href = window.location.href + "&avatarPlay=false";
    //}

}

function FindParent(parentID, livm) {
    if (livm.ID == parentID) return livm;
    for (var k = 0; k < livm.subItems().length; k++) {
        var retVal = FindParent(parentID, livm.subItems()[k]);
        if (retVal != null) return retVal;
    }
    return null;
}

function FindMyParent(ID, livm) {
    if (!ID) return livm;
    for (var k = 0; k < livm.subItems().length; k++) {
        if (livm.subItems()[k].ID == ID) return livm;
        var retVal = FindMyParent(ID, livm.subItems()[k]);
        if (retVal != null) return retVal;
    }
    return null;
}

function FilterStopPropogation(filter, event) {
    if (event.keyCode == 13) {
        event.cancelBubble = true;
        try { event.stopPropagation(); } catch (ex) { }
        filter.blur();
        return false;
    }
}

function LoadFullMap(mapIndex) {
    try { event.stopPropagation(); } catch (ex) { }
    mainVM.LoadFullMap(mapIndex);
}

function ShowDirections() {
    $('.slideout').removeClass('out');
    $('.slideout').addClass('tab');
    $('.slideout').addClass('extra');
    $('.mainRightSlideContainer').addClass('mainRightSlideContainerOut');
    $('.mainRightSlideContainer').addClass('mainRightSlideContainerOutRight');
    $('.hiddenObject').addClass('hide');
    $('.quickButton').addClass('buttonOut');
    $('.iconSwitchOut').addClass('tabIconsOut');
    $('#directionsSlideout').addClass('directionTabHide');
    $('.buttonContainer').addClass('buttonContainerOut');
	$('div.MapNavBar.NavBarVisible').removeClass('portraitHide');
	$('#QRcode').removeClass('hide');
	$('.avatarVideoLarge').addClass('avatarVideoLargeDirectionsOut');
    $('.menuButton').addClass('hide');
    $('#directionsSlideout').addClass('out');
    $('.fullpage, .MapNavBar').removeClass('rightOut');
    $('.fullpage, .MapNavBar').removeClass('rightTabs');
    $('.fullpage, .MapNavBar').addClass('leftOut');
	 $('.callIcon').addClass('callIconOut');
     $('.liveConnectStyle').addClass('liveConnectStyleOut');
    $('#mapControlBtns').addClass('mapControlBtnsSwitchPosition');
    if ($('.MapNavBar').hasClass('NavBarVisible')) {
        $('#mapControlBtns').addClass('mapControlBtnKeepTop');
        $('#mapControlBtns').removeClass('mapControlBtnKeepBottom');
    }
    else {
        $('#mapControlBtns').addClass('mapControlBtnKeepBottom');
        $('#mapControlBtns').removeClass('mapControlBtnKeepTop');
    }
    $('#mapControlBtns').removeClass('mapControlBtnsSetPosition');

}

function HideDirections() {
    $('.slideout').removeClass('out');
    $('#directionsSlideout').removeClass('extra');
    $('.iconSwitchOut').removeClass('tabIconsOut');
	$('#QRcode').addClass('hide');
    $('.menuButton').addClass('hide');
    $('.slideout').removeClass('tab');
    $('#directionsSlideout').removeClass('directionTabHide');
    $('.buttonContainer').removeClass('buttonContainerOut');
    $('#rightContainer').removeClass('mainRightSlideContainerOut');
    $('#rightContainer').removeClass('mainRightSlideContainerOutRight');
	$('div.MapNavBar.NavBarVisible').addClass('portraitHide');
    $('.hiddenObject').removeClass('hide');
	$('.avatarVideoLarge').removeClass('avatarVideoLargeDirectionsOut');
    $('.quickButton').removeClass('buttonOut');
    $('.fullpage, .MapNavBar').removeClass('rightOut');
    $('.fullpage, .MapNavBar').addClass('rightTabs');
    $('.fullpage, .MapNavBar').removeClass('leftOut');
	$('.callIcon').removeClass('callIconOut');
    $('.liveConnectStyle').removeClass('liveConnectStyleOut');
    $('#mapControlBtns').removeClass('mapControlBtnsRightOpenPosition mapControlBtnsSwitchPosition');
    if ($('.MapNavBar').hasClass('NavBarVisible')) {
        $('#mapControlBtns').addClass('mapControlBtnKeepTop');
        $('#mapControlBtns').removeClass('mapControlBtnKeepBottom');
    }
    else {
        $('#mapControlBtns').addClass('mapControlBtnKeepBottom');
        $('#mapControlBtns').removeClass('mapControlBtnKeepTop');
    }
    $('#mapControlBtns').addClass('mapControlBtnsSetPosition mapControlBtnKeepTop');
    CANCELPOPOVER = false;
    hidePopover();
    mainVM.CenterMap();
}

function DisablePrint() {
    window.print = function emptyMethod() { };
}

function DisableReporting() {
    ALLOWREPORTING = false;
}

function EnableReporting() {
    ALLOWREPORTING = true;
}



function setupPopover() {
    if (document.documentElement.clientHeight < document.documentElement.clientWidth)
    {
        $('#navSlideout').popover({
            title: 'Trying to get somewhere?',
            content: 'Click here to get directions to anywhere in the hospital',
            placement: 'left',
        });
		TranslateText(mainVM.CurrentLanguage(), 'Click here to get directions to anywhere in the hospital', UpdatePopoverContent);
		TranslateText(mainVM.CurrentLanguage(), 'Trying to get somewhere?', UpdatePopoverTitle);
		$('#navSlideout').popover('show');
		$('#navSlideout').popover('hide');
	}
	else{}

}

function UpdatePopoverContent(result) {
    if ($('#navSlideout').data('bs.popover')) {
        $('#navSlideout').data('bs.popover').options.content = result;
        $('#navSlideout').popover('show');
        $('#navSlideout').popover('hide');
    }
}

function UpdatePopoverTitle(result) {
    if ($('#navSlideout').data('bs.popover')) {
        $('#navSlideout').data('bs.popover').options.title = result;
        $('#navSlideout').popover('show');
        $('#navSlideout').popover('hide');
    }
}

window.onerror = function (errorMsg, url, lineNumber) {
    if (window.external && ('HandleError' in window.external)) {
        window.external.HandleError(url + ": " + lineNumber + ":" + errorMsg);
    }
    return true;
}

function IsImageOk(img) {
    // During the onload event, IE correctly identifies any images that
    // weren’t downloaded as not complete. Others should too. Gecko-based
    // browsers act like NS4 in that they report this incorrectly.
    if (!img.complete) {
        return false;
    }

    // However, they do have two very useful properties: naturalWidth and
    // naturalHeight. These give the true size of the image. If it failed
    // to load, either of these should be zero.

    if (typeof img.naturalWidth !== "undefined" && img.naturalWidth === 0) {
        return false;
    }

    // No other way of checking: assume it’s ok.
    return true;
}

