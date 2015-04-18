var echarts;
var webUserChart;
require(['echarts', 'echarts/chart/bar'], function(ec) {
    echarts = ec;
    webUserChart = ec.init(document.getElementById('web_user_charts'));

    onDocumentReady("day");
});

function onDocumentReady(type) {
    _items = document.URL.split("/")
    if (_items.length >= 5) {
        if (_items[4].length == "53be5588c3666e0add000001".length) {
            // appkey, {user,user_active,user_new,user_total}
            fetch(_items[4], _items[5], type);
        }
    }
}

function getUserValue(user, userType) {
    var value = 0;
    if (userType == "user_new") {
        value = user.NewUser
    } else if (userType == "user_active") {
        value = user.ActiveUser
    } else {
        value = user.User
    }
    return value
}

function getUserRateHtml(user, userType) {
    var value = "";
    if (userType == "user_new") {
        value = "<td>" + user.NewUserRate + "</td>"
    } else if (userType == "user_active") {
        value = "<td>" + user.ActiveUserRate + "</td>"
    }
    return value
}

function updateTable(webUser, userType) {
    var html_table = "";
    if (webUser == null) {
        $("#tb_body").html(html_table);
        return
    }
    $.each(webUser, function(i, user) {
        _date = "<td>" + user.IntDate + "</td>"
        _platform = "<td>" + user.Platform + "</td>"
        _sum = "<td>" + getUserValue(user, userType) + "</td>"
        _rate = getUserRateHtml(user, userType)
        html_table += "<tr>" + _date + _platform + _sum + _rate + "</tr>"
    });
    $("#tb_body").html(html_table);
}

function fetch(appkey, userType, type) {
    // http://localhost:8080/report/53be5588c3666e0add000001/user?vt=json
    // appkey = "53be5588c3666e0add000001"
    // userURL = "/report/" + appkey + "/user?vt=json"

    if (document.URL.indexOf("?") == -1) {
        userURL = document.URL + "?vt=json"
    } else {
        userURL = document.URL + "&vt=json"
    }
    if (document.URL.indexOf("type=") == -1) {
        userURL = userURL + "&type=" + type
    }

    $.getJSON(userURL, function(data) {
        console.log(data)
        if (data == null) return;

        data.WebUser.sort(function compare(a, b) {
            return a.IntDate - b.IntDate;
        });
        series_data = [];

        updateTable(data.WebUser, userType)

        console.log("userType:", userType)
        webUserChart.setOption({});
        webUserChart.clear()

        $.each(data.WebUser, function(i, webuser) {
            var _idx = -1;
            $.each(series_data, function(i) {
                if (series_data[i].name == webuser.Platform) {
                    _idx = i;
                    return
                }
            });

            var value = getUserValue(webuser, userType);

            if (_idx >= 0) {
                series_data[_idx].data.push(value);
                series_data[_idx].Date.push(webuser.IntDate);
            } else {
                var _data = {};
                _data.name = webuser.Platform;
                _data.type = "line";
                _data.tiled = '总量';
                _data.data = [value];
                _data.Date = [webuser.IntDate];
                series_data.push(_data);
            }
        });

        legend_data = [];
        xAxis_data = [];
        $.each(series_data, function(i, _pData) {
            legend_data.push(_pData.name)
            if (xAxis_data.length == 0) {
                xAxis_data = _pData.Date
            }
        });

        console.log("xAxis_data:", xAxis_data)
        console.log("series_data:", series_data)

        var option = {
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: legend_data
            },
            toolbox: {
                show: true,
                feature: {
                    dataView: {
                        show: false,
                        readOnly: false
                    },
                    magicType: {
                        show: true,
                        type: ['line', 'bar', 'stack', 'tiled']
                    },
                    restore: {
                        show: true
                    },
                    saveAsImage: {
                        show: true
                    },
                    mark: {
                        show: false
                    }
                }
            },
            calculable: true,
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                data: xAxis_data
            }],
            yAxis: [{
                type: 'value'
            }],
            series: series_data
        };
        // 为echarts对象加载数据
        webUserChart.setOption(option);

        console.log("echarts setOption")

    });
}

$('.btn-user-type').click(function() {
    type = $(this)[0].innerText.toLowerCase()
    onDocumentReady(type)
});
