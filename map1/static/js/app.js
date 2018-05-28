//map1
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
var mapdata = [];
//绘制全国地图，获取全国地图的json
$.getJSON('static/map/china.json', function (data) {
  //新建一个空数组
  d = [];
  //循环遍历
  for (var i = 0; i < data.features.length; i++) {
    //将数据中的name，push到新数组中
    d.push({
      name: data.features[i].properties.name
    })
  }
  //把这个数组赋给全局的mapdata
  mapdata = d;
  //注册地图
  echarts.registerMap('china', data);
  //绘制地图
  renderMap('china', d);
});

//地图点击事件
chart.on('click', function (params) {
  //点击事件输出获取到的数据
  console.log(params);
  //如果点击的这个地方的name省份的列表中，绘制二级地图
  if (params.name in provinces) {
    //如果点击的是34个省、市、自治区，绘制选中地区的二级地图
    //json的路径进行拼接
    $.getJSON('static/map/province/' + provinces[params.name] + '.json', function (data) {
      echarts.registerMap(params.name, data);
      var d = [];
      for (var i = 0; i < data.features.length; i++) {
        d.push({
          name: data.features[i].properties.name
        })
      }
      renderMap(params.name, d);
    });
  } else if (params.seriesName in provinces) {
    //如果是【直辖市/特别行政区】只有二级下钻
    if (special.indexOf(params.seriesName) >= 0) {
      renderMap('china', mapdata);
    } else {
      //排除直接点击省份，和特殊地区这两种情况，点击的事件就是点击了二级地图
      //显示县级地图
      $.getJSON('static/map/city/' + cityMap[params.name] + '.json', function (data) {
        echarts.registerMap(params.name, data);
        var d = [];
        for (var i = 0; i < data.features.length; i++) {
          d.push({
            name: data.features[i].properties.name
          })
        }
        renderMap(params.name, d);
      });
    }
  } else {
    //排除上面的三种情况，到达三级地图之后，再点击就是重绘全国地图
    renderMap('china', mapdata);
  }
});

//初始化绘制全国地图配置
var option = {
  backgroundColor: '#000',
  title: {
    text: '中国联通',
    subtext: 'china',
    link: 'http://www.ldsun.com',
    left: 'center',
    textStyle: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'normal',
      fontFamily: "Microsoft YaHei"
    },
    subtextStyle: {
      color: '#ccc',
      fontSize: 13,
      fontWeight: 'normal',
      fontFamily: "Microsoft YaHei"
    }
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b}'
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
        color: '#fff'
      }
    }
  },
  animationDuration: 1000,
  animationEasing: 'cubicOut',
  animationDurationUpdate: 1000,
};


function renderMap(map, data) {
  option.title.subtext = map;
  option.series = [{
    name: map,
    type: 'map',
    mapType: map,
    roam: false,
    nameMap: {
      'china': '中国'
    },
    label: {
      normal: {
        show: true,
        textStyle: {
          color: '#999',
          fontSize: 13
        }
      },
      emphasis: {
        show: true,
        textStyle: {
          color: '#fff',
          fontSize: 13
        }
      }
    },
    itemStyle: {
      normal: {
        areaColor: '#323c48',
        borderColor: 'dodgerblue',
        borderWidth: 2,
        shadowColor: 'rgba(63, 218, 255, 0.5)',
        shadowBlur: 20
      },
      emphasis: {
        areaColor: 'darkorange'
      }
    },
    data: data
  }];
  //渲染地图
  chart.setOption(option);
}