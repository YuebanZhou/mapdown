//map5
//地图容器
var chart = echarts.init(document.getElementById('main'));
var line = echarts.init(document.getElementById('line'));
//34个省、市、自治区的名字拼音映射数组
var provinces = {
  //23个省
  "台湾": "taiwan",
  "河北": "hebei",
  "山西": "shanxi",
  "辽宁": "liaoning",
  "吉林": "jilin",
  "黑龙江": "heilongjiang",
  "江苏": "jiangsu",
  "浙江": "zhejiang",
  "安徽": "anhui",
  "福建": "fujian",
  "江西": "jiangxi",
  "山东": "shandong",
  "河南": "henan",
  "湖北": "hubei",
  "湖南": "hunan",
  "广东": "guangdong",
  "海南": "hainan",
  "四川": "sichuan",
  "贵州": "guizhou",
  "云南": "yunnan",
  "陕西": "shanxi1",
  "甘肃": "gansu",
  "青海": "qinghai",
  //5个自治区
  "新疆": "xinjiang",
  "广西": "guangxi",
  "内蒙古": "neimenggu",
  "宁夏": "ningxia",
  "西藏": "xizang",
  //4个直辖市
  "北京": "beijing",
  "天津": "tianjin",
  "上海": "shanghai",
  "重庆": "chongqing",
  //2个特别行政区
  "香港": "xianggang",
  "澳门": "aomen"
};

//直辖市和特别行政区-只有二级地图，没有三级地图
var special = ["北京", "天津", "上海", "重庆", "香港", "澳门"];
//临时数组，用来承载地图相关参数
var mapdata = [];
//绘制全国地图
$.getJSON('static/map/china.json', function (data) {
  console.log("绘制全国地图");

  d = [];
  //遍历json文件中的地图数据
  for (var i = 0; i < data.features.length; i++) {
    d.push({
      name: data.features[i].properties.name,
      value: data.features[i].properties.cp
    })
  }
  //mapdata数组中包含name和cp地理坐标
  mapdata = d;
  //注册地图
  echarts.registerMap('china', data);
  //绘制地图
  renderMap('china', d);
});
//地图点击事件
chart.on('click', function (params) {
  if (params.name in provinces) {
    console.log("第一级下钻到第二级");
    //如果点击的是34个省、市、自治区，绘制选中地区的二级地图
    //provinces[params.name]表示获取provinces的键值对中，params.name键对应的值
    $.getJSON('static/map/province/' + provinces[params.name] + '.json', function (data) {
      //注册地图，两个参数，name和data
      echarts.registerMap(params.name, data);
      var d = [];
      for (var i = 0; i < data.features.length; i++) {
        d.push({
          name: data.features[i].properties.name,
          value: data.features[i].properties.cp
        })
      }
      //渲染地图，参数是当前的name，和d数组
      renderMap(params.name, d);
    });
  } else if (params.name in cityMap) {
    //如果是【直辖市/特别行政区】只有二级下钻
    if (special.indexOf(params.name) >= 0) {
      console.log("特殊地区");
      renderMap('china', mapdata);
    } else {
      console.log("第二级下钻到第三级");
      //显示县级地图
      $.getJSON('static/map/city/' + cityMap[params.name] + '.json', function (data) {
        echarts.registerMap(params.name, data);
        var d = [];
        for (var i = 0; i < data.features.length; i++) {
          d.push({
            name: data.features[i].properties.name,
            value: data.features[i].properties.cp
          })
        }
        renderMap(params.name, d);
      });
    }
  } else {
    renderMap('china', mapdata);
  }

});
//数据的排序
function NumDescSort(a, b) {
  return a.value - b.value;
}
/* 添加内容end */
function renderMap(map, data) {

  //渲染地图之前先将全屏折线图隐藏
  $("#line").hide()
  //数组，name为地区名称，value为值
  var jdata = []
  //跳转的虚拟json地址
  var url = '';
  //点大小
  var dot = 0;
  //y轴名称列表
  var titledata = [];
  //根据map判断
  if (map == 'china') {
    url = 'china';
    dot = 3;
  } else if (map in provinces) {
    url = 'provinces/' + provinces[map];
    dot = 9;
  } else {
    url = 'city/' + cityMap[map];
    dot = 15;
  }
  //对chart的相关内容进行配置
  //渲染副标题的内容
  var subtext = map;
  if (subtext == "china") {
    subtext = "中国"
  }
  $("#text").html(subtext)
  var width = $("#text").width() / 2;
  $("#text").css("margin-right", -width)

  //初始化绘制全国地图配置
  var option = {
    backgroundColor: '#404A59',
    title: [{
      text: '中国联通',
      subtext: ' ',
      link: 'http://www.ldsun.com',
      left: 'center',
      textStyle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'normal',
        fontFamily: "Microsoft YaHei"
      }
    }, {
      text: '折线图',
      right: 100,
      top: 50,
      textStyle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'normal',
        fontFamily: "Microsoft YaHei"
      }
    }],

    tooltip: {
      trigger: 'item',
      formatter: function (data) {
        return ('当前区域:' + data.name +
          '</br>经度:' + data.value[0] +
          '<br>纬度:' + data.value[1]
        );
      },
    },
    toolbox: {
      show: true,
      orient: 'vertical',
      left: 'right',
      top: 'center',
      feature: {
        dataView: {
          readOnly: false
        },
        restore: {},
        saveAsImage: {}
      },
      iconStyle: {
        normal: {
          color: '#ccc'
        }
      }
    },
    //geo配合series实现地图加载功能和坐标点功能
    geo: {
      show: true,
      map: map,
      label: {
        normal: {
          show: false
        },
        emphasis: {
          show: false,
        }
      },
      left: 50,
      // width: '70%',
      // height: '70%',
      roam: false,
      itemStyle: {
        normal: {
          areaColor: '#323c48',
          borderColor: 'dodgerblue',
          borderWidth: 1,
          shadowColor: 'rgba(63, 218, 255, 0.5)',
          shadowBlur: 5
        },
        emphasis: {
          //areaColor: '#323c48'
          areaColor: '#BFA930'
        }
      }
    },
    visualMap: {
      id: 'dot',
      min: 0,
      max: 1000,
      //显示拖拽手柄
      calculable: true,
      inRange: {
        color: ['#50a3ba', '#eac736', '#d94e5d']
      },
      textStyle: {
        color: '#fff'
      },
      text: ['高', '低'],
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLabel: {
        show: true,
        textStyle: {
          color: '#fff'
        },
        //数据全部展示，不隐藏
        interval: 0
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        show: true,
        textStyle: {
          color: '#fff'
        },
        //数据全部展示，不隐藏
        interval: 0
      },
    },
    grid: {
      right: 50,
      top: 100,
      width: '25%',
      height: '35%'
    },
    series: [{
      //地理坐标点
      name: map,
      type: 'effectScatter',
      map: map,
      // mapType: map,
      //使用地理坐标系
      coordinateSystem: 'geo',
      data: data,
      roam: false,
      //selectedMode: 'single',
      symbolSize: 5,
      nameMap: {
        'china': '中国'
      },
      label: {
        normal: {
          show: true,
          formatter: '{b}',
          position: 'right',
          textStyle: {
            color: "#fff",
            fontSize: 13
          }
        },
        emphasis: {
          show: true,
          textStyle: {
            color: "#fff",
            fontSize: 13
          }
        }
      },
      itemStyle: {
        normal: {
          color: '#fff',
          areaColor: '#fff',
          borderColor: '#fff',
          borderWidth: 0,
          shadowColor: '#fff',
          shadowBlur: 0
        },
        emphasis: {
          color: '#fff',
          areaColor: '#fff',
          borderColor: '#fff',
          borderWidth: 0,
          shadowColor: '#fff',
          shadowBlur: 0
        }
      },
      zlevel: 1
    }, {
      //热力散点图
      name: 'dot',
      type: 'scatter',
      map: map,
      // mapType: map,
      //使用地理坐标系
      coordinateSystem: 'geo',
      data: sdata,
      roam: false,
      //selectedMode: 'single',
      symbolSize: dot,
      zlevel: 0,
    }, {
      type: 'line',
      data: [120, 132, 101, 134, 90, 230, 210]
    }]

  };
  //渲染地图
  chart.setOption(option);
}
var ldata = [136, 114, 247, 142, 193, 58, 100];
var wdata = ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
//全屏和退出全屏
$("#btn1").click(function (e) {
  $("#main").css("height", "100%")
  var element = document.documentElement;
  if (!$('body').hasClass("full-screen")) {
    $('body').addClass("full-screen");
    $('#alarm-fullscreen-toggler').addClass("active");
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }

  } else {
    $('body').removeClass("full-screen");
    $('#alarm-fullscreen-toggler').removeClass("active");
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }

  }
})
$("#btn2").click(function () {
  $("#main").hide();
  $("#line").show();

  var optionline = {
    title: {
      text: '门店活动详细信息',
      subtext: '数量',
      textStyle: {
        color: '#fff'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      top: '15%',
      containLabel: true
    },
    calculable: true,
    xAxis: [{
      type: 'category',
      boundaryGap: false,
      data: wdata,
      axisLabel: {
        show: true,
        textStyle: {
          color: '#fff'
        },
        //数据全部展示，不隐藏
        interval: 0
      },
    }],
    yAxis: {
      type: 'value',
      axisLabel: {
        show: true,
        textStyle: {
          color: '#fff'
        },
        //数据全部展示，不隐藏
        interval: 0
      },
    },
    series: [{
      name: '新办数',
      type: 'line',
      smooth: false,
      // itemStyle: {
      //   normal: {
      //     areaStyle: {
      //       type: 'default'
      //     }
      //   }
      // },
      //data: [136, 375, 380, 449, 114, 267, 142, 318, 357, 193, 421, 391]
      data: ldata
    }]
  };
  line.setOption(optionline);
  timeout = setInterval(function () {
    ldata.push(ldata.shift())
    wdata.push(wdata.shift())
    line.setOption(optionline);
  }, 1000)
  //clearInterval(timeout)
})
$("#btn3").click(function () {
  $("#main").show()
  $("#line").hide()
  renderMap('china', mapdata);
})