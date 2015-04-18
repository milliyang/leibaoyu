// < script type = "text/javascript" >
// 路径配置
// require.config({
//     paths: {
//         'echarts': 'http://echarts.baidu.com/build/echarts',
//         'echarts/chart/bar': 'http://echarts.baidu.com/build/echarts'
//     }
// });
// require.config({
//     paths: {
//         'echarts': 'http://localhost:8080/static/echarts-2.0.2/echarts',
//         'echarts/chart/bar': 'http://localhost:8080/static/echarts-2.0.2/echarts'
//     }
// });

使用
var eq = require(
    [
        'echarts',
        'echarts/chart/bar' // 使用柱状图就加载bar模块，按需加载
    ],
    function(ec) {
        // 基于准备好的dom，初始化echarts图表
        var myChart = ec.init(document.getElementById('echar_main'));
        var option = {
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['Android', 'iOS', 'Both']
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
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            }],
            yAxis: [{
                type: 'value'
            }],
            series: [{
                name: 'Android',
                type: 'line',
                stack: '总量',
                data: [120, 132, 101, 134, 90, 230, 210]
            }, {
                name: 'iOS',
                type: 'line',
                stack: '总量',
                data: [220, 182, 191, 234, 290, 330, 310]
            }, {
                name: 'Both',
                type: 'line',
                stack: '总量',
                data: [150, 232, 201, 154, 190, 330, 410]
            }]
        };
        // 为echarts对象加载数据
        myChart.setOption(option);
    }
);
// < /script>
