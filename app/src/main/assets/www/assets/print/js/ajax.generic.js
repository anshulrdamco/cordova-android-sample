function ajax_CallMethod(url, type, parameters, successCallback, errorCallback) {
    var param = null;
    if (parameters) {
        param = parameters;
    }
    $.ajax({
        type: type,
        url: url,
        data: param,
        dataType: "json",
        async: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (typeof successCallback === 'function') {
                successCallback(result);
            }
        },
        error: function (error) {
            if (typeof errorCallback === 'function') {
                errorCallback(error);
            }
        }
    });
}


function ajax_CallMethodFormData(url, type, parameters, successCallback, errorCallback) {
    var param = null;
    if (parameters) {
        param = parameters;
    }
    $.ajax({
        type: type,
        url: url,
        data: param,
        contentType: false,
        enctype: "multipart/form-data",
        processData: false,
        success: function (result) {
            if (typeof successCallback === 'function') {
                successCallback(result);
            }
        },
        error: function (error) {
            if (typeof errorCallback === 'function') {
                errorCallback(error);
            }
        }
    });
}
