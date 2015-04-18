var echarts;
var webFirmwareTypeCharts;
var webFirmwareVersionCharts = [];
var webFirmwareTrendCharts;

var defaultToolBox = {
    show: true,
    feature: {
        mark: {
            show: false
        },
        dataView: {
            show: false,
            readOnly: false
        },
        restore: {
            show: false
        },
        saveAsImage: {
            show: true
        }
    }
};

var trendToolbox = {
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
};

var defaultTooltip = {
    trigger: 'item',
    formatter: "{a} <br/>{b} : {c} ({d}%)"
};

require(['echarts', 'echarts/chart/bar'], function(ec) {
    echarts = ec;
    webFirmwareTypeCharts = ec.init(document.getElementById('web_firmware_type_charts'));
    webFirmwareVersionCharts[0] = ec.init(document.getElementById('web_firmware_version_charts'));
    webFirmwareVersionCharts[1] = ec.init(document.getElementById('web_firmware_version_charts2'));
    webFirmwareVersionCharts[2] = ec.init(document.getElementById('web_firmware_version_charts3'));
    webFirmwareVersionCharts[3] = ec.init(document.getElementById('web_firmware_version_charts4'));

    webFirmwareTrendCharts = ec.init(document.getElementById('web_firmware_trend_charts'));

    onDocumentReady("all");
});

function onDocumentReady(type) {
    _items = document.URL.split("/")
    if (_items.length >= 5) {
        if (_items[4].length == "53be5588c3666e0add000001".length) {
            // appkey
            fetch(_items[4], type);
        }
    }
}

function updateTable(webFirmware) {
    var html_table = "";
    if (webFirmware == null) {
        $("#tb_body").html(html_table);
        return
    }
    sortSet = webFirmware.slice();
    sortSet.sort(function compare(a, b) {
        return b.IntDate - a.IntDate;
    });
    $.each(sortSet, function(i, firmware) {
        _date = "<td>" + firmware.IntDate + "</td>"
        _type = "<td>" + firmware.Type + "</td>"
        _ftype = "<td>" + firmware.FirmwareType + "</td>"
        _version = "<td>" + firmware.Version + "</td>"
        _sum = "<td>" + firmware.Sum + "</td>"
        html_table += "<tr>" + _date + _type + _ftype + _version + _sum + "</tr>"
    });
    $("#tb_body").html(html_table);
}

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length - size);
}

function fetch(appkey, type) {
    // http://localhost:8080/report/53be5588c3666e0add000001/app?vt=json
    // appkey = "53be5588c3666e0add000001"
    var userURL
    if (document.URL.indexOf("?") == -1) {
        userURL = document.URL + "?vt=json"
    } else {
        userURL = document.URL + "&vt=json"
    }
    if (document.URL.indexOf("type=") == -1){
        userURL =  userURL + "&type=" + type
    }

    var today = new Date()
    var years = today.getFullYear();
    var months = today.getMonth() + 1;
    var day = today.getDate()
    var strToday = years + pad(months, 2) + pad(day, 2)
    $.getJSON(userURL + "&date=" + strToday, function(data) {
        console.log(data)
        if (data == null) return;

        type_series_data = [];
        type_legend_data = [];
        $.each(data.WebFirmware, function(i, webFirmware) {
            var _data = {};
            var _idx = -1;
            $.each(type_series_data, function(i) {
                if (type_series_data[i].name == webFirmware.FirmwareType) {
                    _idx = i;
                    return
                }
            });
            if (_idx >= 0) {
                type_series_data[_idx].value += parseInt(webFirmware.Sum);
            } else {
                _data.name = webFirmware.FirmwareType;
                _data.value = parseInt(webFirmware.Sum);
                type_series_data.push(_data);
                type_legend_data.push(webFirmware.FirmwareType);
            }
        });
        console.log(type_series_data)
        console.log(type_legend_data)
        var option = {
            title: {
                text: 'Firmware',
                subtext: 'type',
                x: 'center'
            },
            tooltip: defaultTooltip,
            legend: {
                orient: 'vertical',
                x: 'left',
                data: type_legend_data
            },
            toolbox: defaultToolBox,
            calculable: true,
            series: [{
                name: 'type',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: type_series_data
            }]
        };
        webFirmwareTypeCharts.setOption(option);

        // version array
        version_array_series_data = []
        $.each(type_legend_data, function(i, data) {
            version_array_series_data[i] = {}
            version_array_series_data[i].tag = data
            version_array_series_data[i].series_data = []
            version_array_series_data[i].legend_data = []
        });

        $.each(data.WebFirmware, function(_i, webFirmware) {
            $.each(version_array_series_data, function(_ii, versionData) {
                if (versionData.tag == webFirmware.FirmwareType) {
                    var _data = {};
                    var _idx = -1;
                    $.each(versionData.series_data, function(i) {
                        if (versionData.series_data[i].name == webFirmware.Version) {
                            _idx = i;
                            return
                        }
                    });
                    if (_idx >= 0) {
                        versionData.series_data[_idx].value += parseInt(webFirmware.Sum);
                    } else {
                        console.log(webFirmware)
                        _data.name = webFirmware.Version;
                        _data.value = parseInt(webFirmware.Sum);
                        versionData.series_data.push(_data);
                        versionData.legend_data.push(_data.name);
                    }
                }
            })
        });
        // console.log(version_array_series_data)
        $.each(version_array_series_data, function(i, versionData) {
            var optionVersionIos = {
                title: {
                    text: versionData.tag,
                    subtext: 'version',
                    x: 'center'
                },
                tooltip: defaultTooltip,
                legend: {
                    orient: 'vertical',
                    x: 'left',
                    data: versionData.legend_data
                },
                toolbox: defaultToolBox,
                calculable: true,
                series: [{
                    name: 'Version',
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '60%'],
                    data: versionData.series_data
                }]
            };
            webFirmwareVersionCharts[i].setOption(optionVersionIos);
        });
    });

    // Firmware Trend:
    $.getJSON(userURL, function(data) {
        console.log(data)
        if (data == null) return;

        updateTable(data.WebFirmware);

        // generate dummy records
        var uniqueDate = [];
        var uniqueKey = [];
        var uniqueKeyDate = [];
        $.each(data.WebFirmware, function(i, web) {
            uniqueDate.push(web.IntDate)
            uniqueKey.push(web.FirmwareType)
            uniqueKeyDate[web.FirmwareType + web.IntDate] = 1
        });
        $.unique(uniqueKey);
        $.unique(uniqueDate);
        console.log("uniqueKeyDate", uniqueKeyDate)

        // generate dummy 0 webclick records
        dummyFirmware = [];
        $.each(uniqueDate, function(i, date) {
            $.each(uniqueKey, function(ii, key) {
                if (uniqueKeyDate[key + date] != 1) {
                    var dummyObj = {};
                    dummyObj.Sum = 0;
                    dummyObj.IntDate = date;
                    dummyObj.FirmwareType = key;
                    dummyFirmware.push(dummyObj);
                }
            });
        });
        console.log("dummyFirmware", dummyFirmware)

        var FullSet = [];
        $.each(data.WebFirmware, function(i, obj) {
            FullSet.push(obj);
        });
        $.each(dummyFirmware, function(i, obj) {
            FullSet.push(obj);
        });
        console.log("FullSet", FullSet)

        FullSet.sort(function compare(a, b) {
            return a.IntDate - b.IntDate;
        });

        // webfirmware sum by [date + firmware_type] !
        sumWebCamera = [];
        $.each(FullSet, function(i, webFirmware) {
            if (webFirmware.FirmwareType == "") {
                webFirmware.FirmwareType = "unknown"
            }

            var _data = {};
            var _idx = -1;
            $.each(sumWebCamera, function(i) {
                if (sumWebCamera[i].IntDate == webFirmware.IntDate &&
                    sumWebCamera[i].FirmwareType == webFirmware.FirmwareType) {
                    _idx = i;
                    return
                }
            });
            if (_idx >= 0) {
                sumWebCamera[_idx].Sum += parseInt(webFirmware.Sum);
            } else {
                _data.IntDate = webFirmware.IntDate;
                _data.FirmwareType = webFirmware.FirmwareType;
                _data.Sum = parseInt(webFirmware.Sum);
                sumWebCamera.push(_data);
            }
        });

        series_data = [];
        legend_data = [];
        $.each(sumWebCamera, function(i, webFirmware) {
            var _data = {};
            var _idx = -1;
            $.each(series_data, function(i) {
                if (series_data[i].name == webFirmware.FirmwareType) {
                    _idx = i;
                    return
                }
            });
            if (_idx >= 0) {
                series_data[_idx].data.push(webFirmware.Sum + "");
                series_data[_idx].date.push(webFirmware.IntDate);
            } else {
                _data.name = webFirmware.FirmwareType;
                _data.data = [webFirmware.Sum + ""];
                _data.date = [webFirmware.IntDate];
                _data.type = 'line';
                _data.tiled = '总量';
                series_data.push(_data);
                legend_data.push(webFirmware.FirmwareType);
            }
        });

        var option = {
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: legend_data
            },
            toolbox: trendToolbox,
            calculable: true,
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                data: series_data[0].date
            }],
            yAxis: [{
                type: 'value'
            }],
            series: series_data
        };
        webFirmwareTrendCharts.clear();
        webFirmwareTrendCharts.setOption(option);
    });
}

$('.btn-type').click(function() {
    onDocumentReady($(this)[0].value)
});
