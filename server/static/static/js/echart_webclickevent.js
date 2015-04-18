var echarts;
var webClickEventChart;
require(['echarts', 'echarts/chart/bar'], function(ec) {
    echarts = ec;
    webClickEventChart = ec.init(document.getElementById('web_click_event_charts'));

    onDocumentReady();
});

selectedPlatform = "android";
selectedGroupBy = "day";
selectedKeyObj = {};
selectedKeyObjCnt = 0;

function onDocumentReady() {
    _items = document.URL.split("/")
    if (_items.length >= 5) {
        if (_items[4].length == "53be5588c3666e0add000001".length) {
            // default
            // fetch(appkey, platform, groupby, keys)
            fetch(_items[4], "android", "day");
        }
    }
}

function updateClickTable(webClickTable) {
    var html_table = "";
    _localSelectedKeyObj = {}

    if (webClickTable == null) {
        $("#tb_body").html(html_table);
        return
    }

    sortWebClick = webClickTable.slice();
    sortWebClick.sort(function compare(a, b) {
        if (a.IntDate != b.IntDate) {
            return b.IntDate - a.IntDate;
        } else {
            return a.Key.localeCompare(b.Key);
        }
    });

    _lastDate = 0

    $.each(sortWebClick, function(i, webclick) {
        _date = "<td>" + webclick.IntDate + "</td>"
        _platform = "<td>" + webclick.Platform + "</td>"
        _key = "<td>" + webclick.Key + "</td>"
        _sum = "<td>" + webclick.Sum + "</td>"
        _percent = "<td>" + webclick.Percent + "%</td>"
        _uncheck_name = "<td> <input class=\"click_checkbox\" type=\"checkbox\" name=\"" + webclick.Key + "\"></td>"
        _check_name = "<td> <input class=\"click_checkbox\" type=\"checkbox\" name=\"" + webclick.Key + "\" checked></td>"

        _name = ""
        if (_localSelectedKeyObj[webclick.Key] == 1) {
            _name = _uncheck_name
        } else if (selectedKeyObj[webclick.Key] == 1) {
            _localSelectedKeyObj[webclick.Key] = 1
            _name = _check_name
        } else {
            _name = _uncheck_name
        }

        if (_lastDate > 0 && _lastDate != webclick.IntDate) {
            html_table += "<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>"
        }
        _lastDate = webclick.IntDate

        html_table += "<tr>" + _date + _platform + _key + _sum + _percent + _name + "</tr>"
    });

    // replace the whole table body
    $("#tb_body").html(html_table);

    // reupdate check event handler
    configCheckBoxs();
}

function fetch(appkey, platform, groupby, keys) {
    // http://localhost:8080/report/53be5588c3666e0add000001/click_event?vt=json
    var userURL
    if (document.URL.indexOf("?") == -1) {
        userURL = document.URL + "?vt=json" + "&platform=" + platform + "&type=" + groupby
    } else {
        userURL = document.URL + "&vt=json" + "&platform=" + platform + "&type=" + groupby
    }

    $.getJSON(userURL, function(data) {
        console.log(data)
        if (data == null) return;

        // refresh the html table
        updateClickTable(data.WebClickTable)

        if (data.WebClickTable == null) {
            webClickEventChart.setOption({});
            webClickEventChart.clear();
            return;
        }

        var uniqueDate = [];
        var uniqueKey = [];
        var uniqueKeyDate = [];
        $.each(data.WebClickTable, function(i, webclick) {
            uniqueDate.push(webclick.IntDate)
            if (selectedKeyObjCnt > 0) {
                // use user select key
                if (selectedKeyObj[webclick.Key] == 1) {
                    uniqueKey.push(webclick.Key)
                    uniqueKeyDate[webclick.Key + webclick.IntDate] = 1
                }
            } else {
                uniqueKey.push(webclick.Key)
                uniqueKeyDate[webclick.Key + webclick.IntDate] = 1
            }
        });
        $.unique(uniqueKey);
        $.unique(uniqueDate);
        uniqueDate.sort(function compare(a, b) {
            return a - b;
        });

        console.log("uniqueKeyDate", uniqueKeyDate)

        // generate dummy 0 webclick records
        dummyWebClick = [];
        $.each(uniqueDate, function(i, date) {
            $.each(uniqueKey, function(ii, key) {
                if (uniqueKeyDate[key + date] != 1) {
                    var dclick = {};
                    dclick.Sum = 0;
                    dclick.IntDate = date;
                    dclick.Key = key;
                    dummyWebClick.push(dclick);
                }
            });
        });
        console.log("dummyWebClick", dummyWebClick)

        var FullSet = [];
        $.each(data.WebClickTable, function(i, webclick) {
            FullSet.push(webclick);
        });
        $.each(dummyWebClick, function(i, webclick) {
            FullSet.push(webclick);
        });
        console.log("FullSet", FullSet)

        FullSet.sort(function compare(a, b) {
            if (a.IntDate != b.IntDate) {
                return a.IntDate - b.IntDate;
            } else {
                return a.Key.localeCompare(b.Key);
            }
        });

        series_data = [];
        first10Key = [];

        $.each(FullSet, function(i, webclick) {
            var _idx = -1;
            $.each(series_data, function(i) {
                if (series_data[i].name == webclick.Key) {
                    _idx = i;
                    return
                }
            });

            if (_idx >= 0) {
                series_data[_idx].data.push(webclick.Sum);
            } else {
                if (selectedKeyObjCnt > 0) {
                    // use user select key
                    if (selectedKeyObj[webclick.Key] == 1) {
                        var _data = {};
                        _data.name = webclick.Key;
                        _data.type = "line";
                        _data.tiled = '总量';
                        _data.data = [webclick.Sum];
                        series_data.push(_data);
                    }
                } else {
                    // show the first 10 keys
                    if (first10Key.length <= 10) {
                        // ignore
                        // continue
                        first10Key.push(webclick.Key)
                        var _data = {};
                        _data.name = webclick.Key;
                        _data.type = "line";
                        _data.tiled = '总量';
                        _data.data = [webclick.Sum];
                        series_data.push(_data);
                    }
                }
            }
        });

        legend_data = [];
        xAxis_data = uniqueDate;
        $.each(series_data, function(i, _pData) {
            legend_data.push(_pData.name)
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
        webClickEventChart.clear();
        webClickEventChart.setOption([]);
        webClickEventChart.setOption(option);
    });
}


function doRefreshOnStatusChanged() {
    _items = document.URL.split("/")
    fetch(_items[4], selectedPlatform, selectedGroupBy);
}

$('#btn_click_apply').click(function() {
    doRefreshOnStatusChanged();
});

// http://stackoverflow.com/questions/20870671/bootstrap-3-btn-group-lose-active-class-when-click-any-where-on-the-page
$(".btn-group > .btn").click(function() {
    $(this).addClass("active").siblings().removeClass("active");
});

// setup click event
$('#op_click_android').click(function() {
    selectedPlatform = "android"
    doRefreshOnStatusChanged();
});
$('#op_click_ios').click(function() {
    selectedPlatform = "ios"
    doRefreshOnStatusChanged();
});

$('#op_click_day').click(function() {
    selectedGroupBy = "day"
    doRefreshOnStatusChanged();
});
$('#op_click_week').click(function() {
    selectedGroupBy = "week"
    doRefreshOnStatusChanged();
});
$('#op_click_month').click(function() {
    selectedGroupBy = "month"
    doRefreshOnStatusChanged();
});
$('#op_click_year').click(function() {
    selectedGroupBy = "year"
    doRefreshOnStatusChanged();
});

function configCheckBoxs() {
    $('.click_checkbox').click(function() {
        if ($(this).is(':checked')) {
            selectedKeyObj[$(this)[0].name] = 1
            selectedKeyObjCnt++
        } else {
            selectedKeyObj[$(this)[0].name] = 0
            selectedKeyObjCnt--
        }
        console.log(selectedKeyObj, "selectedKeyObjCnt:", selectedKeyObjCnt)
    });
}
configCheckBoxs();
