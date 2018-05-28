//map2
//地图容器
var chart = echarts.init(document.getElementById('main'));
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
  console.log("执行了");

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
  //console.log(resultdata0);
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


//初始化绘制全国地图配置
var option = {
  backgroundColor: '#000',
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
    },
    subtextStyle: {
      color: '#ddd',
      fontSize: 12,
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
  }
};

//数据的排序
function NumDescSort(a, b) {
  return a.value - b.value;
}

/* 添加内容end */
function renderMap(map, data) {
  //数组，name为地区名称，value为值
  console.log(map);
  var jdata = []
  var url = '';
  //y轴名称列表
  var titledata = [];
  if (map == 'china') {
    url = 'china'
  } else if (map in provinces) {
    url = 'provinces/' + provinces[map]
  } else {
    url = 'city/' + cityMap[map]
  }
  console.log(url);
  //绘制全国地图的时候，执行请求操作
  $.ajax({
    type: "post",
    dataType: "json",
    url: "./static/json/" + url + ".json",

    success: function (result) {
      console.log("成功");
      //请求成功之后，将数据push到数组中
      for (var i = 0; i < result.length; i++) {
        jdata.push({
          name: result[i].name,
          value: result[i].value
        })
      }
      //将省份名称push到y轴的临时数组中
      for (var i = 0; i < jdata.length; i++) {
        titledata.push(jdata[i].name)
      }
      //按照数据的大小进行排序
      jdata.sort(NumDescSort);
      //对chart的相关内容进行配置
      //渲染副标题的内容
      var subtext = map;
      console.log(subtext);
      if (subtext == "china") {
        subtext = "中国"
      }
      $("#text").html(subtext)
      var width = $("#text").width() / 2;
      $("#text").css("margin-right", -width)
      //geo配合series实现地图加载功能和坐标点功能
      option.geo = {
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
        left: 100,
        roam: false,
        itemStyle: {
          normal: {
            areaColor: '#323c48',
            borderColor: 'dodgerblue',
            borderWidth: 2,
            shadowColor: 'rgba(63, 218, 255, 0.5)',
            shadowBlur: 20
          },
          emphasis: {
            areaColor: 'rgba(63, 218, 255, 0.5)'
          }
        }
      };
      //series中两个对象，一个对地图坐标进行设置，另一个对象对柱状图进行设置
      option.series = [{
        name: map,
        type: 'scatter',
        map: map,
        // mapType: map,
        //使用地理坐标系
        coordinateSystem: 'geo',
        data: data,
        roam: false,
        //selectedMode: 'single',
        symbolSize: 10,
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
            areaColor: '#fff',
            borderColor: 'dodgerblue',
            borderWidth: 1,
            shadowColor: 'rgba(63, 218, 255, 0.5)',
            shadowBlur: 10
          },
          emphasis: {
            areaColor: '#fff',
          }
        },
      }, {
        //柱状图的内容确定了颜色字体等属性
        name: 'bar',
        z: 2,
        type: 'bar',
        label: {
          normal: {
            show: true,
            textStyle: {
              color: "#fff",
              fontSize: 10
            }
          },
          emphasis: {
            show: true,
            textStyle: {
              color: "#fff",
              fontSize: 10
            }
          }
        },

        itemStyle: {
          normal: {
            color: '#A65800',
          },
          emphasis: {
            color: "rgb(254,153,78)"
          }
        },
        //柱状图的渲染
        data: jdata

      }];
      //柱状图组件的位置和大小
      option.grid = {
        right: 50,
        top: 100,
        width: '20%',
        height: '70%'
      };
      option.xAxis = [{
        position: 'top',
        type: 'value',
        //不留白
        boundaryGap: false,
        splitLine: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        //设置标识的样式
        axisLabel: {
          show: true,
          textStyle: {
            color: '#fff'
          }
        }
      }];
      //柱状图的纵坐标
      option.yAxis = [{
        type: 'category',
        data: titledata,
        //保证刻度和标签对齐
        axisTick: {
          alignWithLabel: true
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: '#fff'
          },
          //数据全部展示，不隐藏
          interval: 0
        },
      }];
      //渲染地图
      chart.setOption(option);

    },
    error: function () {
      console.log("失败");
    }
  })
}

$("#btn").click(function (e) {
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