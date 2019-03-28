window.onerror = ErrHandler;

function ErrHandler(message, url, line) {
    //un minify line number via https://github.com/mozilla/source-map/    https://github.com/mozilla/source-map/blob/master/lib/source-map/source-map-consumer.js 
    //not possible to un-minify exactly without column as well as line
    if (RESTSERVICESBASE) {
        $.post(RESTSERVICESBASE + "api/error/" + "?ClientID=" + (mainVM && mainVM.clientVM && mainVM.clientVM.clientID ? mainVM.clientVM.clientID() : '') + "&message=" + message + "&url=" + url + "&line=" + line + "&userAgent=" + navigator.userAgent + "&href=" + window.location.href);
    } else {
        $.post("http://localhost:52149/api/error/" + "?ClientID=" + (mainVM && mainVM.clientVM && mainVM.clientVM.clientID ? mainVM.clientVM.clientID() : '') + "&message=" + message + "&url=" + url + "&line=" + line + "&userAgent=" + navigator.userAgent + "&href=" + window.location.href);
        $.post("http://ljrestservice.azurewebsites.net/api/error/" + "?ClientID=" + (mainVM && mainVM.clientVM && mainVM.clientVM.clientID ? mainVM.clientVM.clientID() : '') + "&message=" + message + "&url=" + url + "&line=" + line + "&userAgent=" + navigator.userAgent + "&href=" + window.location.href);
        $.post("http://ef76d7d3e6c0436fa4c6c3b4e753c966.cloudapp.net/MobileService.svc/" + "?ClientID=" + (mainVM && mainVM.clientVM && mainVM.clientVM.clientID ? mainVM.clientVM.clientID() : '') + "&message=" + message + "&url=" + url + "&line=" + line + "&userAgent=" + navigator.userAgent + "&href=" + window.location.href);
        $.post("http://wayfinderlj-restservice.cloudapp.net/MobileService.svc/" + "?ClientID=" + (mainVM && mainVM.clientVM && mainVM.clientVM.clientID ? mainVM.clientVM.clientID() : '') + "&message=" + message + "&url=" + url + "&line=" + line + "&userAgent=" + navigator.userAgent + "&href=" + window.location.href);
    }
   //setTimeout(function () { window.location.href = window.location.href + "&Retry=" + new Date() }, 100);  //reload to try to fix

} 