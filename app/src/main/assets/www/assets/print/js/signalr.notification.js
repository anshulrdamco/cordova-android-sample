$(document).ready(function () {
    //var url = "http://localhost:52149/signalr";
    //var url = "http://ljwayapi.local/signalr";
    var url = RESTSERVICESBASE + "signalr";
    var ResponseStatusType =
    {
        Success: "Success",
        Error: "Error",
        InvalidModal: "InvalidModal",
        Denied: "Denied"
    };

    function loadAlertNotifications() {
        if (PORTAL_PARAMETERS_LOADED) {
            var ClientId = mainVM.ClientVM.clientID();
            var hasAlertManagement = mainVM.ClientVM.hasAlertManagement();
            if(hasAlertManagement)
            {
                var quicklink = getParameterByName(window.location.href, "location");
                if (quicklink)
                {
                    $.getScript(url + "/hubs", function () {
                        $.connection.hub.url = url;
                        var alertHub = $.connection.alertHub;

                        var alertNotificaitonModal = mainVM.AlertNotificationVM();

                        alertHub.client.showAlert = function (alertModel) {

                            alertNotificaitonModal.ShowAlert(alertModel);
                            alertHub.server.confirmDelivery(quicklink, ClientId, alertModel.Id);
                        }

                        alertHub.client.hideAlert = function (alertId, alertType) {
                            alertNotificaitonModal.RemoveAlert(alertId, alertType);
                        }

                        alertHub.client.showAlertUpdate = function (alertUpdateModel) {
                            alertNotificaitonModal.ShowAlertUpdate(alertUpdateModel);
                        }

                        alertHub.client.hideStatusAlertUpdate = function (alertUpdateModel) {
                            alertNotificaitonModal.HideStatusAlertUpdate(alertUpdateModel);
                        }

                        alertHub.client.loadActiveAlerts = function (response) {
                            switch (response.Status) {
                                case ResponseStatusType.Success: {
                                    if (response.Data && response.Data.length > 0)
                                    {
                                        alertNotificaitonModal.loadActiveAlerts(response.Data);
                                    }
                                    break;
                                }
                                case ResponseStatusType.InvalidModal:
                                case ResponseStatusType.Error:
                                case ResponseStatusType.Denied:
                                    {
                                        console.log('error occured in loading active alerts');
                                        break;
                                    }
                            }
                        }

                        alertNotificaitonModal.CallAlertExpiredFromSignalR = function (alertId) {
                            alertHub.server.alertExpired(alertId, ClientId);
                        }

                        $.connection.hub.start()
                        .done(function () {
                            console.log("Signalr: Connected!=" + $.connection.hub.id);
                            alertHub.server.joinKioskUser(quicklink, ClientId);

                            alertHub.server.loadActiveAlerts(quicklink, ClientId);
                        })
                        .fail(function () {
                            console.log("Signalr: Could not connect to server!");
                        });
                        alertHub.disconnect(function () {
                            console.log('Signalr Disconnected has disconnected');
                        });
                    });
                }

            }
            
        } else {
            setTimeout(loadAlertNotifications, 100);
        }
    }

    loadAlertNotifications();

});


