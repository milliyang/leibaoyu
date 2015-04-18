var echarts;
var webActivityChart;

selectedPlatform = "android";
selectedGroupBy = "day";
selectedKeyObj = {};
selectedKeyObjCnt = 0;

require(['echarts', 'echarts/chart/bar'], function(ec) {
    echarts = ec;
    webActivityChart = ec.init(document.getElementById('web_activity_charts'));

    onDocumentReady();
});

function onDocumentReady() {
    _items = document.URL.split("/")
    if (_items.length >= 5) {
        if (_items[4].length == "53be5588c3666e0add000001".length) {
            fetch(_items[4], selectedPlatform, selectedGroupBy);
        }
    }
}

// skip "class com.imaginevision."
function getActivityShortName(activityName) {
    var shortIdx = activityName.indexOf(".", activityName.indexOf(".") + 1);
    return activityName.substring(shortIdx + 1);
}

function updateClickTable(webActivity) {
    var html_table = "";
    _localSelectedKeyObj = {}

    localSort = webActivity.slice();
    localSort.sort(function compare(a, b) {
        if (a.IntDate != b.IntDate) {
            return b.IntDate - a.IntDate;
        } else {
            return a.Name.localeCompare(b.Name);
        }
    });

    _lastDate = 0

    $.each(localSort, function(i, webAct) {
        _date = "<td>" + webAct.IntDate + "</td>"
        _platform = "<td>" + webAct.Platform + "</td>"
        _key = "<td>" + webAct.Name + "</td>"
        _stay = "<td>" + webAct.Stay.toFixed(2) + "</td>"
        _sum = "<td>" + webAct.LaunchCnt + "</td>"
        _percent = "<td>" + webAct.LaunchRate.toFixed(2) + "%</td>"
        _uncheck_name = "<td> <input class=\"click_checkbox\" type=\"checkbox\" name=\"" + webAct.Name + "\"></td>"
        _check_name = "<td> <input class=\"click_checkbox\" type=\"checkbox\" name=\"" + webAct.Name + "\" checked></td>"

        _name = ""
        var shortName = getActivityShortName(webAct.Name);
        if (_localSelectedKeyObj[shortName] == 1) {
            _name = _uncheck_name
        } else if (selectedKeyObj[shortName] == 1) {
            _localSelectedKeyObj[shortName] = 1
            _name = _check_name
        } else {
            _name = _uncheck_name
        }

        if (_lastDate > 0 && _lastDate != webAct.IntDate) {
            html_table += "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>"
        }
        _lastDate = webAct.IntDate

        html_table += "<tr>" + _date + _platform + _key + _stay + _sum + _percent + _name + "</tr>"
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
        updateClickTable(data.WebActivity)

        data.WebActivity.sort(function compare(a, b) {
            if (a.IntDate != b.IntDate) {
                return a.IntDate - b.IntDate;
            } else {
                return a.Name.localeCompare(b.Name);
            }
        });

        var uniqueDate = [];
        var uniqueKey = [];
        var uniqueKeyDate = [];
        $.each(data.WebActivity, function(i, webAct) {
            uniqueDate.push(webAct.IntDate)
            if (selectedKeyObjCnt > 0) {
                var shortName = getActivityShortName(webAct.Name);
                if (selectedKeyObj[shortName] == 1) {
                    uniqueKey.push(webAct.Name)
                    uniqueKeyDate[webAct.Name + webAct.IntDate] = 1
                }
            } else {
                uniqueKey.push(webAct.Name)
                uniqueKeyDate[webAct.Name + webAct.IntDate] = 1
            }
        });
        $.unique(uniqueKey);
        $.unique(uniqueDate);
        console.log("uniqueKeyDate", uniqueKeyDate)

        // generate dummy 0 webActivity records
        dummyWebAct = [];
        $.each(uniqueDate, function(i, date) {
            $.each(uniqueKey, function(ii, key) {
                if (uniqueKeyDate[key + date] != 1) {
                    var dclick = {};
                    dclick.LaunchCnt = 0;
                    dclick.IntDate = date;
                    dclick.Name = key;
                    dummyWebAct.push(dclick);
                }
            });
        });
        console.log("dummyWebAct", dummyWebAct)

        var FullSet = [];
        $.each(data.WebActivity, function(i, webAct) {
            FullSet.push(webAct);
        });
        $.each(dummyWebAct, function(i, webAct) {
            FullSet.push(webAct);
        });
        console.log("FullSet", FullSet)

        // FullSet.sort(function compare(a, b) {
        //     return a.IntDate - b.IntDate;
        // });
        FullSet.sort(function compare(a, b) {
            if (a.IntDate != b.IntDate) {
                return a.IntDate - b.IntDate;
            } else {
                return a.Name.localeCompare(b.Name);
            }
        });

        console.log("sort FullSet", FullSet)

        series_data = [];
        first10Key = [];

        $.each(FullSet, function(i, webAct) {
            var _idx = -1;

            var shortName = getActivityShortName(webAct.Name);

            $.each(series_data, function(i) {
                if (series_data[i].name == shortName) {
                    _idx = i;
                    return
                }
            });

            if (_idx >= 0) {
                series_data[_idx].data.push(webAct.LaunchCnt);
            } else {
                if (selectedKeyObjCnt > 0) {
                    // use user select key
                    if (selectedKeyObj[shortName] == 1) {
                        var _data = {};
                        _data.name = shortName;
                        _data.type = "line";
                        // _data.stack = '总量';
                        _data.tiled = '总量';
                        _data.data = [webAct.LaunchCnt];
                        series_data.push(_data);
                    }
                } else {
                    // show the first 10 keys
                    if (first10Key.length <= 10) {
                        // ignore
                        // continue
                        first10Key.push(shortName)
                        var _data = {};
                        _data.name = shortName;
                        _data.type = "line";
                        // _data.stack = '总量';
                        _data.tiled = '总量';
                        _data.data = [webAct.LaunchCnt];
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
        webActivityChart.setOption([]);
        webActivityChart.setOption(option);
    });
}

function doRefreshOnStatusChanged() {
    _items = document.URL.split("/")
    fetch(_items[4], selectedPlatform, selectedGroupBy);
}

$('#btn_activity_apply').click(function() {
    doRefreshOnStatusChanged();
});

// http://stackoverflow.com/questions/20870671/bootstrap-3-btn-group-lose-active-class-when-click-any-where-on-the-page
$(".btn-group > .btn").click(function() {
    $(this).addClass("active").siblings().removeClass("active");
});

// setup click event
$('#op_activity_android').click(function() {
    selectedPlatform = "android"
    doRefreshOnStatusChanged();
});
$('#op_activity_ios').click(function() {
    selectedPlatform = "ios"
    doRefreshOnStatusChanged();
});

$('#op_activity_day').click(function() {
    selectedGroupBy = "day"
    doRefreshOnStatusChanged();
});
$('#op_activity_week').click(function() {
    selectedGroupBy = "week"
    doRefreshOnStatusChanged();
});
$('#op_activity_month').click(function() {
    selectedGroupBy = "month"
    doRefreshOnStatusChanged();
});
$('#op_activity_year').click(function() {
    selectedGroupBy = "year"
    doRefreshOnStatusChanged();
});

function configCheckBoxs() {
    $('.click_checkbox').click(function() {
        var shortName = getActivityShortName($(this)[0].name);
        if ($(this).is(':checked')) {
            selectedKeyObj[shortName] = 1
            selectedKeyObjCnt++
        } else {
            selectedKeyObj[shortName] = 0
            selectedKeyObjCnt--
        }
        console.log(selectedKeyObj, "selectedKeyObjCnt:", selectedKeyObjCnt)
    });
}
configCheckBoxs();
