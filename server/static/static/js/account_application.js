var updateRequest = function(url) {
    $.getJSON(url, function(data) {
        console.log(data)
        if (data == null) {
            $(".alert-danger").html("请求失败！")
            $(".alert-danger").show()
            window.setTimeout(alertHideTimeout, 1000);
            return;
        }
        if (data.Code == 0) {
            window.location.reload()
            $(".alert-success").html(data.Msg);
            $(".alert-success").hide()
        } else {
            $(".alert-danger").html(data.Msg)
            $(".alert-danger").show()
        }
        window.setTimeout(alertHideTimeout, 1000);
    });
}

var alertHideTimeout = function() {
    $(".alert").hide()
}

$(document).ready(function() {
    $(".alert").hide()
    $('.input_app_add').click(function() {
        appkey = $(this)[0].attributes.xref.value;
        email = $('#' + "input_add_" + appkey)[0].value;
        // /account/application/appkey/add?email=xxxxx
        url = document.URL + "/" + appkey + "/add?email=" + email + "&vt=json"
        updateRequest(url);
    });

    $('.input_app_nickname').click(function() {
        appkey = $(this)[0].attributes.xref.value;
        nickname = $('#' + "input_nickname_" + appkey)[0].value;
        // /account/application/appkey/update?nickname=xxxxx
        url = document.URL + "/" + appkey + "/update?nickname=" + nickname + "&vt=json"
        updateRequest(url);
    });

    $('.btn-user-del').click(function() {
        appkey = $(this)[0].attributes.xref.value;
        email = $(this)[0].attributes.email.value;
        // /account/application/appkey/update?email=xxxxx
        url = document.URL + "/" + appkey + "/del?email=" + email + "&vt=json"
        updateRequest(url);
    });
});
