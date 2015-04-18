var echarts;
var webDeviceModelAndroidCharts;
var webDeviceModelIosCharts;
var webDeviceVersionIosCharts;
var webDeviceVersionAndroidCharts;

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

var defaultTooltip = {
    trigger: 'item',
    formatter: "{a} <br/>{b} : {c} ({d}%)"
};

require(['echarts', 'echarts/chart/bar'], function(ec) {
    echarts = ec;
    webDeviceModelAndroidCharts = ec.init(document.getElementById('web_device_model_android_charts'));
    webDeviceModelIosCharts = ec.init(document.getElementById('web_device_model_ios_charts'));

    webDeviceVersionAndroidCharts = ec.init(document.getElementById('web_device_version_android_charts'));
    webDeviceVersionIosCharts = ec.init(document.getElementById('web_device_version_ios_charts'));

    onDocumentReady("all");
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

function updateTable(webDev) {
    var html_table = "";
    if (webDev == null) {
        $("#tb_body").html(html_table);
        return
    }
    $.each(webDev, function(i, dev) {
        _date = "<td>" + dev.IntDate + "</td>"
        _platform = "<td>" + dev.Platform + "</td>"
        _type = "<td>" + dev.Type + "</td>"
        _version = "<td>" + dev.Version + "</td>"
        _model = "<td>" + dev.Model + "</td>"
        _os = "<td>" + dev.Os + "</td>"
        _sdkint = "<td>" + dev.SdkInt + "</td>"
        _sum = "<td>" + dev.Sum + "</td>"
        html_table += "<tr>" + _date + _type + _platform + _model + _version + _os + _sdkint + _sum + "</tr>"
    });
    $("#tb_body").html(html_table);
}

function fetch(appkey, userType, type) {
    // http://localhost:8080/report/53be5588c3666e0add000001/device?vt=json
    // appkey = "53be5588c3666e0add000001"
    // userURL = "/report/" + appkey + "/device?vt=json"
    var userURL
    if (document.URL.indexOf("?") == -1) {
        userURL = document.URL + "?vt=json"
    } else {
        userURL = document.URL + "&vt=json"
    }
    if (document.URL.indexOf("type=") == -1){
        userURL =  userURL + "&type=" + type
    }

    $.getJSON(userURL, function(data) {
        console.log(data)
        if (data == null) return;
        updateTable(data.WebDevice)

        if (data.WebDevice == null) {
            webDeviceModelIosCharts.clear();
            webDeviceModelAndroidCharts.clear();
            webDeviceVersionIosCharts.clear();
            webDeviceVersionAndroidCharts.clear();
            return;
        }

        model_android_series_data = [];
        model_android_legend_data = [];
        model_ios_series_data = [];
        model_ios_legend_data = [];

        $.each(data.WebDevice, function(i, webDevice) {
            var _data = {};
            var _idx = -1;
            if (webDevice.Platform == "android") {
                $.each(model_android_series_data, function(i) {
                    if (model_android_series_data[i].name == webDevice.Model) {
                        _idx = i;
                        return
                    }
                });
                if (_idx >= 0) {
                    model_android_series_data[_idx].value += parseInt(webDevice.Sum);
                } else {
                    _data.name = webDevice.Model;
                    _data.value = parseInt(webDevice.Sum);
                    model_android_series_data.push(_data);
                    model_android_legend_data.push(webDevice.Model);
                }
            } else {
                //ios
                $.each(model_ios_series_data, function(i) {
                    if (model_ios_series_data[i].name == webDevice.Model) {
                        _idx = i;
                        return
                    }
                });
                if (_idx >= 0) {
                    model_ios_series_data[_idx].value += parseInt(webDevice.Sum);
                } else {
                    _data.name = webDevice.Model;
                    _data.value = parseInt(webDevice.Sum);
                    model_ios_series_data.push(_data);
                    model_ios_legend_data.push(webDevice.Model);
                }
            }
        });

        var option = {
            title: {
                text: 'Android',
                subtext: 'phone/tablet',
                x: 'center'
            },
            tooltip: defaultTooltip,
            legend: {
                orient: 'vertical',
                x: 'left',
                data: model_android_legend_data
            },
            toolbox: defaultToolBox,
            calculable: true,
            series: [{
                name: 'Model',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: model_android_series_data
            }]
        };
        webDeviceModelAndroidCharts.setOption(option);

        var optionModelIos = {
            title: {
                text: 'iOS',
                subtext: 'iPhone/iPad',
                x: 'center'
            },
            tooltip: defaultTooltip,
            legend: {
                orient: 'vertical',
                x: 'left',
                data: model_ios_legend_data
            },
            toolbox: defaultToolBox,
            calculable: true,
            series: [{
                name: 'Model',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: model_ios_series_data
            }]
        };
        webDeviceModelIosCharts.setOption(optionModelIos);

        // Version
        version_android_series_data = [];
        version_android_legend_data = [];
        version_ios_series_data = [];
        version_ios_legend_data = [];

        $.each(data.WebDevice, function(i, webDevice) {
            var _data = {};
            var _idx = -1;
            if (webDevice.Platform == "android") {
                $.each(version_android_series_data, function(i) {
                    if (version_android_series_data[i].name == webDevice.Version) {
                        _idx = i;
                        return
                    }
                });
                if (_idx >= 0) {
                    version_android_series_data[_idx].value += parseInt(webDevice.Sum);
                } else {
                    _data.name = webDevice.Version;
                    _data.value = parseInt(webDevice.Sum);
                    version_android_series_data.push(_data);
                    version_android_legend_data.push(webDevice.Version);
                }
            } else {
                //ios
                $.each(version_ios_series_data, function(i) {
                    if (version_ios_series_data[i].name == webDevice.Version) {
                        _idx = i;
                        return
                    }
                });
                if (_idx >= 0) {
                    version_ios_series_data[_idx].value += parseInt(webDevice.Sum);
                } else {
                    _data.name = webDevice.Version;
                    _data.value = parseInt(webDevice.Sum);
                    version_ios_series_data.push(_data);
                    version_ios_legend_data.push(webDevice.Version);
                }
            }
        });

        var optionAndroidChannel = {
            title: {
                text: 'Android',
                subtext: 'system version',
                x: 'center'
            },
            tooltip: defaultTooltip,
            legend: {
                orient: 'vertical',
                x: 'left',
                data: version_android_legend_data
            },
            toolbox: defaultToolBox,
            calculable: true,
            series: [{
                name: 'Version',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: version_android_series_data
            }]
        };
        webDeviceVersionAndroidCharts.setOption(optionAndroidChannel);

        var optionIosChannel = {
            title: {
                text: 'iOS',
                subtext: 'system version',
                x: 'center'
            },
            tooltip: defaultTooltip,
            legend: {
                orient: 'vertical',
                x: 'left',
                data: version_ios_legend_data
            },
            toolbox: defaultToolBox,
            calculable: true,
            series: [{
                name: 'Version',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: version_ios_series_data
            }]
        };
        webDeviceVersionIosCharts.setOption(optionIosChannel);
    });
}

$('.btn-type').click(function() {
    onDocumentReady($(this)[0].value)
});
