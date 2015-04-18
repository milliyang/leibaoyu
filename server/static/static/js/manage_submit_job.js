var requestingCounter = 0;

var submitJob = function(msg) {
    requestingCounter++;
    console.log(msg);
    console.log("requestingCounter:" + requestingCounter);

    $.getJSON(msg, function(data) {
        requestingCounter--;
        if (data == null) {
            $(".alert-danger").html("请求失败！")
            $(".alert-danger").show()
            window.setTimeout(showTimeout, 1000);
            return;
        }

        if (data.Code == 0) {
            $(".alert-success").html(data.Msg);
            $(".alert-success").show()
        } else {
            $(".alert-danger").html(data.Msg)
            $(".alert-danger").show()
        }
        window.setTimeout(showTimeout, 1000);
    });
}

var showTimeout = function() {
    $(".alert").hide()
}

$(document).ready(function() {
    $(".alert").hide()
    $(".btn-dev").click(function() {

        accountDate = $('#account_date_input')[0].value
        if (accountDate != "") {
            submitJob($(this).attr("href") + "&date=" + accountDate)
        } else {
            submitJob($(this).attr("href"))
        }

    });
});
