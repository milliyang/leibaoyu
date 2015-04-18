APPKEY = ""

var refreshTable = function(virtualUser) {
    var html_table = "";
    $.each(virtualUser, function(i, one) {
        _imei = "<td> <a href=\"/query/" + APPKEY + "/" + one.Imei + "/user\">" + one.Imei + "</a> </td>"
        _platform = "<td>" + one.Platform + "</td>"
        _date = "<td>" + one.LastLaunchIntDate + "</td>"

        html_table += "<tr>" + _imei + _platform + _date + "</tr>"

        $("#alert-warning-result").hide();
    });
    // replace the whole table body
    $("#tb_body").html(html_table);
}

var showMessageInTable = function(msg) {
    html_table = "<tr><td>" + msg + "</td></tr>"
    $("#tb_body").html(html_table);
}

// imei>> 358239054631439
// imei>> mac:ac:22:0b:40:64:b6
// imei>> B445CD67-D710-410D-903F-580DB849D038
// macaddr>> 20:59:a0:b1:d3:e0
var fetch = function(appkey, input) {
    pairs = ""
    if (input.length == "20:59:a0:b1:d3:e0".length) {
        pairs = "&macaddr=" + input
    } else {
        pairs = "&imei=" + input
    }

    var userURL
    if (document.URL.indexOf("?") == -1) {
        userURL = document.URL + "?vt=json" + pairs
    } else {
        userURL = document.URL + "&vt=json" + pairs
    }
    $.getJSON(userURL, function(data) {
        console.log(data)
        if (data == null) {
            $("#alert-warning-result").show();
            return;
        } else if (data.Code > 0) {
            showMessageInTable(data.Data);
        } else if (data.VUser == null) {
            showMessageInTable("mac addr no match");
        } else {
            // refresh the html table
            refreshTable(data.VUser);
        }
    });
}

// Call fetch On Load
$(document).ready(function() {
    _items = document.URL.split("/")
});

var go_find = function() {
    _items = document.URL.split("/")
    _input = $('#btn_query_input')[0].value
    if (_items.length >= 5) {
        if (_items[4].length == "53be5588c3666e0add000001".length) {
            APPKEY = _items[4]
            fetch(_items[4], _input)
        }
    }
}

// setup click event
$('#btn_query_go').click(function() {
    go_find();
});

$('#btn_query_input').keypress(function(e) {
    if (e.which == '13') {
        // "Enter" Key Press
        go_find();
    }
});

$("#alert-warning-result").hide();
