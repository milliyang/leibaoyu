var echarts;
var webCameraCharts;

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

var innerItemStyle = {
    normal: {
        label: {
            position: 'inner',
            formatter: function(a, b, c, d) {
                return (d - 0).toFixed(0) + '%'
            }
        },
        labelLine: {
            show: false
        }
    },
    emphasis: {
        label: {
            show: true,
            formatter: "{b}\n{d}%"
        }
    }
};

var defaultTooltip = {
    trigger: 'item',
    formatter: "{a} <br/>{b} : {c} ({d}%)"
};

require(['echarts', 'echarts/chart/bar'], function(ec) {
    echarts = ec;
    webCameraCharts = ec.init(document.getElementById('web_camera_charts'));

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

function updateTable(webCamera) {
    var html_table = "";
    if (webCamera == null) {
        $("#tb_body").html(html_table);
        return
    }
    $.each(webCamera, function(i, cam) {
        _date = "<td>" + cam.IntDate + "</td>"
        _type = "<td>" + cam.Type + "</td>"
        _prod = "<td>" + cam.IdProduct + "</td>"
        _vendor = "<td>" + cam.IdVendor + "</td>"
        _sum = "<td>" + cam.Sum + "</td>"
        html_table += "<tr>" + _date + _type + _prod + _vendor + _sum + "</tr>"
    });
    $("#tb_body").html(html_table);
}

function fetch(appkey, type) {
    // http://localhost:8080/report/53be5588c3666e0add000001/app?vt=json
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

        updateTable(data.WebCamera);

        vendor_series_data = [];
        product_series_data = [];
        legend_data = [];

        $.each(data.WebCamera, function(i, webCamera) {
            var _data = {};
            var _idx = -1;
            $.each(vendor_series_data, function(i) {
                if (vendor_series_data[i].name == webCamera.IdVendor) {
                    _idx = i;
                    return
                }
            });
            if (_idx >= 0) {
                vendor_series_data[_idx].value += parseInt(webCamera.Sum);
            } else {
                _data.name = webCamera.IdVendor;
                _data.value = parseInt(webCamera.Sum);
                vendor_series_data.push(_data);
                legend_data.push(webCamera.IdVendor);
            }

            _data = {};
            _idx = -1;
            $.each(product_series_data, function(i) {
                if (product_series_data[i].name == webCamera.IdProduct) {
                    _idx = i;
                    return
                }
            });
            if (_idx >= 0) {
                product_series_data[_idx].value += parseInt(webCamera.Sum);
            } else {
                _data.name = webCamera.IdProduct;
                _data.value = parseInt(webCamera.Sum);
                product_series_data.push(_data);
                legend_data.push(webCamera.IdProduct);
            }
        });
        console.log(product_series_data)
        console.log(vendor_series_data)
        console.log(legend_data)

        var option = {
            tooltip: {
                show: true,
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                data : legend_data
            },
            toolbox: defaultToolBox,
            calculable: true,
            series: [{
                name: '生产厂商',
                type: 'pie',
                center: ['35%', 200],
                radius: 80,
                itemStyle: innerItemStyle,
                data : vendor_series_data
            }, {
                name: '相机型号',
                type: 'pie',
                center: ['35%', 200],
                radius: [110, 140],
                data : product_series_data
            }]
        };
        webCameraCharts.setOption(option);

    });
}

$('.btn-type').click(function() {
    onDocumentReady($(this)[0].value)
});
