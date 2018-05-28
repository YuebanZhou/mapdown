//map3
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
  console.log("加载全国地图执行了");
  d = [];
  //遍历json文件中的地图数据
  for (var i = 0; i < data.features.length; i++) {
    d.push({
      name: data.features[i].properties.name,
      //value: data.features[i].properties.cp
    })
  }
  //mapdata数组中包含name和cp地理坐标
  mapdata = d;
  //注册地图
  echarts.registerMap('china', data);
  //绘制地图
  renderMap('china', d, "provinces");
});
//地图点击事件
chart.on('click', function (params) {

  if (params.name in provinces) {
    console.log("第一级下钻到第二级");
    //如果点击的是34个省、市、自治区，绘制选中地区的二级地图
    //provinces[params.name]表示获取provinces的键值对中，params.name键对应的值
    $.getJSON('static/map/province/' + provinces[params.name] + '.json', function (data) {
      console.log("获取到省级json");

      //注册地图，两个参数，name和data
      echarts.registerMap(params.name, data);
      var d = [];
      for (var i = 0; i < data.features.length; i++) {
        d.push({
          name: data.features[i].properties.name,
          //value: data.features[i].properties.cp
        })
      }
      var url = provinces[params.name]
      //渲染地图，参数是当前的name，和d数组
      renderMap(params.name, d, 'provinces/'+url);
    });
  } else if (params.name in cityMap) {
    //如果是【直辖市/特别行政区】只有二级下钻
    if (special.indexOf(params.name) >= 0) {
      console.log("特殊地区");
      var url = provinces[params.name]
      renderMap('china', mapdata, 'provinces/'+url);
    } else {
      console.log("第二级下钻到第三级");
      //显示县级地图
      $.getJSON('static/map/city/' + cityMap[params.name] + '.json', function (data) {
        echarts.registerMap(params.name, data);
        var d = [];
        for (var i = 0; i < data.features.length; i++) {
          d.push({
            name: data.features[i].properties.name,
            //value: data.features[i].geometry.coordinates[0][0][0]
          })
        }
        var url = cityMap[params.name]
        renderMap(params.name, d, 'city/'+url);
      });
    }
  } else {
    renderMap('china', mapdata, "provinces");
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
    formatter: function (mapdata) {
      return (mapdata.name);
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
function renderMap(map, data, url) {
  //数组，name为地区名称，value为值
  var jdata = []
  //y轴名称列表
  var titledata = [];

  //绘制全国地图的时候，执行请求操作
  $.ajax({
    type: "post",
    dataType: "json",
    url: "./static/json/" + url + ".json",
    success: function (result) {
      console.log("请求成功");
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
      if (subtext == "china") {
        subtext = "中国"
      }
      $("#text").html(subtext)
      var width = $("#text").width() / 2;
      $("#text").css("margin-right", -width)
      option.series = [{
        z: 1,
        name: '全部',
        type: 'map',
        map: map,
        height: "80%",
        left: 100,
        zoom: 1,
        label: {
          normal: {
            show: true,
            textStyle: {
              color: "#000",
              fontSize: 13,
              fontStyle: 'bold'
            }
          },
          emphasis: {
            show: true,
            textStyle: {
              color: "#000",
              fontSize: 13
            }
          }
        },
        itemStyle: {
          normal: {
            // areaColor: '#323c48',
            borderColor: '#fff',
            borderWidth: 1,
            shadowColor: '#fff',
            shadowBlur: 5
          },
          emphasis: {
            areaColor: 'rgba(63, 218, 255, 0.5)'
          }
        },
        //roam: true,
        data: jdata
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
      option.visualMap = {
          min: 0,
          max: 1000,
          left: 'left',
          top: 'bottom',
          text: ['高', '低'],
          calculable: true,
          colorLightness: [0.2, 100],
          color: ['lightskyblue', 'yellow', 'orangered'],
          dimension: 0,
          textStyle: {
            color: '#fff',
            fontSize: 13
          }
        },
        //渲染地图
        chart.setOption(option);

    },
    error: function () {
      console.log("请求失败");
    }
  })
}