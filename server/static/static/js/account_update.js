var updateRequest = function(pair) {
    url = document.URL + "?" + pair + "&vt=json"
    $.getJSON(url, function(data) {
        console.log(data)
        if (data == null) {
            $(".alert-danger").html("请求失败！")
            $(".alert-danger").show()
            window.setTimeout(alertHideTimeout, 1000);
            return;
        }
        if (data.Code == 0) {
            $(".alert-success").html(data.Msg);
            $(".alert-success").show()
        } else {
            $(".alert-danger").html(data.Msg)
            $(".alert-danger").show()
        }
        window.setTimeout(alertHideTimeout, 1000);
    });
}

var alertHideTimeout = function() {
    window.location.reload()
    $(".alert").hide()
}

$(document).ready(function() {
    $(".alert").hide()
    $('#go_input_ac_qq').click(function() {
        updateRequest("qq=" + $('#input_ac_qq')[0].value)
    });
    $('#go_input_ac_nickname').click(function() {
        updateRequest("nickname=" + $('#input_ac_nickname')[0].value)
    });
    $('#go_input_send_verify').click(function() {
        updateRequest("action=verify")
    });
});
