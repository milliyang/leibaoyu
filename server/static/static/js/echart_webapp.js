var echarts;
var webAppVersionAndroidCharts;
var webAppVersionIosCharts;
var webAppChannelIosCharts;
var webAppChannelAndroidCharts;
var webAppPlatformCharts;

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
    webAppVersionAndroidCharts = ec.init(document.getElementById('web_app_version_android_charts'));
    webAppVersionIosCharts = ec.init(document.getElementById('web_app_version_ios_charts'));

    webAppChannelAndroidCharts = ec.init(document.getElementById('web_app_channel_android_charts'));
    webAppChannelIosCharts = ec.init(document.getElementById('web_app_channel_ios_charts'));

    webAppPlatformCharts = ec.init(document.getElementById('web_app_ios_vs_android_charts'));

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

function updateTable(webApp) {
    var html_table = "";
    if (webApp == null) {
        $("#tb_body").html(html_table);
        return
    }
    $.each(webApp, function(i, app) {
        _date = "<td>" + app.IntDate + "</td>"
        _platform = "<td>" + app.Platform + "</td>"
        _type = "<td>" + app.Type + "</td>"
        _version = "<td>" + app.Version + "</td>"
        _channel = "<td>" + app.Channel + "</td>"
        _sum = "<td>" + app.Sum + "</td>"
        html_table += "<tr>" + _date + _type + _platform + _version + _channel + _sum + "</tr>"
    });
    $("#tb_body").html(html_table);
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

    $.getJSON(userURL, function(data) {
        console.log(data)
        if (data == null) return;

        updateTable(data.WebApp)

        version_android_series_data = [];
        version_android_legend_data = [];
        version_ios_series_data = [];
        version_ios_legend_data = [];

        $.each(data.WebApp, function(i, webApp) {
            var _data = {};
            var _idx = -1;
            if (webApp.Platform == "android") {
                $.each(version_android_series_data, function(i) {
                    if (version_android_series_data[i].name == webApp.Version) {
                        _idx = i;
                        return
                    }
                });
                if (_idx >= 0) {
                    version_android_series_data[_idx].value += parseInt(webApp.Sum);
                } else {
                    _data.name = webApp.Version;
                    _data.value = parseInt(webApp.Sum);
                    version_android_series_data.push(_data);
                    version_android_legend_data.push(webApp.Version);
                }
            } else {
                //ios
                $.each(version_ios_series_data, function(i) {
                    if (version_ios_series_data[i].name == webApp.Version) {
                        _idx = i;
                        return
                    }
                });
                if (_idx >= 0) {
                    version_ios_series_data[_idx].value += parseInt(webApp.Sum);
                } else {
                    _data.name = webApp.Version;
                    _data.value = parseInt(webApp.Sum);
                    version_ios_series_data.push(_data);
                    version_ios_legend_data.push(webApp.Version);
                }
            }
        });

        var option = {
            title: {
                text: 'Android Version',
                subtext: 'phone/tablet',
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
        webAppVersionAndroidCharts.setOption(option);

        var optionVersionIos = {
            title: {
                text: 'iOS Version',
                subtext: 'iPhone/iPad',
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
        webAppVersionIosCharts.setOption(optionVersionIos);

        // Channel
        channel_android_series_data = [];
        channel_android_legend_data = [];
        channel_ios_series_data = [];
        channel_ios_legend_data = [];

        $.each(data.WebApp, function(i, webApp) {
            var _data = {};
            var _idx = -1;
            if (webApp.Platform == "android") {
                $.each(channel_android_series_data, function(i) {
                    if (channel_android_series_data[i].name == webApp.Channel) {
                        _idx = i;
                        return
                    }
                });
                if (_idx >= 0) {
                    channel_android_series_data[_idx].value += parseInt(webApp.Sum);
                } else {
                    _data.name = webApp.Channel;
                    _data.value = parseInt(webApp.Sum);
                    channel_android_series_data.push(_data);
                    channel_android_legend_data.push(webApp.Channel);
                }
            } else {
                //ios
                $.each(channel_ios_series_data, function(i) {
                    if (channel_ios_series_data[i].name == webApp.Channel) {
                        _idx = i;
                        return
                    }
                });
                if (_idx >= 0) {
                    channel_ios_series_data[_idx].value += parseInt(webApp.Sum);
                } else {
                    _data.name = webApp.Channel;
                    _data.value = parseInt(webApp.Sum);
                    channel_ios_series_data.push(_data);
                    channel_ios_legend_data.push(webApp.Channel);
                }
            }
        });

        var optionAndroidChannel = {
            title: {
                text: 'Android Channel',
                subtext: 'release channel',
                x: 'center'
            },
            tooltip: defaultTooltip,
            legend: {
                orient: 'vertical',
                x: 'left',
                data: channel_android_legend_data
            },
            toolbox: defaultToolBox,
            calculable: true,
            series: [{
                name: 'Channel',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: channel_android_series_data
            }]
        };
        webAppChannelAndroidCharts.setOption(optionAndroidChannel);

        var optionIosChannel = {
            title: {
                text: 'iOS Channel',
                subtext: 'release channel',
                x: 'center'
            },
            tooltip: defaultTooltip,
            legend: {
                orient: 'vertical',
                x: 'left',
                data: channel_ios_legend_data
            },
            toolbox: defaultToolBox,
            calculable: true,
            series: [{
                name: 'Channel',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: channel_ios_series_data
            }]
        };
        webAppChannelIosCharts.setOption(optionIosChannel);

        // ios vs. android
        platform_series_data = [];
        platform_legend_data = [];
        $.each(data.WebApp, function(i, webApp) {
            var _data = {};
            var _idx = -1;
            $.each(platform_series_data, function(i) {
                if (platform_series_data[i].name == webApp.Platform) {
                    _idx = i;
                    return
                }
            });
            if (_idx >= 0) {
                platform_series_data[_idx].value += parseInt(webApp.Sum);
            } else {
                _data.name = webApp.Platform;
                _data.value = parseInt(webApp.Sum);
                platform_series_data.push(_data);
                platform_legend_data.push(webApp.Platform);
            }
        });

        var optionCompare = {
            title: {
                text: 'App Compare',
                subtext: 'total app',
                x: 'center'
            },
            tooltip: defaultTooltip,
            legend: {
                orient: 'vertical',
                x: 'left',
                data: platform_legend_data
            },
            toolbox: defaultToolBox,
            calculable: true,
            series: [{
                name: 'iOS vs. Android',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: platform_series_data
            }]
        };
        webAppPlatformCharts.setOption(optionCompare);
    });
}

$('.btn-type').click(function() {
    onDocumentReady($(this)[0].value)
});
