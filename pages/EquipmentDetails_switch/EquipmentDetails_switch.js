// pages/temperature/index.js
import * as echarts from '../../components/ec-canvas/echarts';
const app = getApp()

let chart = null;
// 缓存页面实例，解决this丢失问题
let pageThis = null;

// 只初始化图表实例，不渲染业务数据
function initChart(canvas, width, height, dpr) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr
  });
  canvas.setChart(chart);

  // 空基础模板，只保留固定样式，数据后续setOption填充
  const baseOption = {
    title: {
      text: '温度与开度曲线图',
      left: 'center',
      top: 10,
      textStyle: { fontSize: 16, color: '#333' }
    },
    tooltip: { trigger: 'axis' },
    legend: { data: ['温度', '开度'], bottom: 0 },
    xAxis: {
      type: 'category',
      data: [],
      axisLabel: { rotate: 30 }
    },
    yAxis: [
      {
        type: 'value',
        name: '温度',
        nameTextStyle: { color: '#f56c6c' },
        axisLabel: { formatter: '{value}℃' }
      },
      {
        type: 'value',
        name: '开度',
        nameTextStyle: { color: '#409eff' },
        axisLabel: { formatter: '{value}cm' },
        splitLine: { show: false }
      }
    ],
    series: [
      { name: '温度', type: 'line', yAxisIndex: 0, data: [], color: '#f56c6c' },
      { name: '开度', type: 'line', yAxisIndex: 1, data: [], color: '#409eff' }
    ],
    grid: { bottom: 150, right: 50 },
    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: 0,
        bottom: 45,
        height: 40,
        handleSize: 55,
        moveHandleSize: 22,
        start: 0,
        end: 40,
        minSpan: 5,
        zoomLock: false,
        filterMode: 'filter',
        handleStyle: { color: '#409EFF', borderWidth: 2 },
        backgroundColor: '#f0f0f0',
        showDataShadow: true
      }
    ]
  };
  chart.setOption(baseOption);
  return chart;
}

Page({
  data: {
    ec: { onInit: initChart },
    isLandscape: false,
    // mode: '',
    // monthVisible: false,
    // month: '2021-09',
    // monthText: '',
    devInfo: "",
    xData: [],
    tempData: [],
    openData: [],
    datetimeStartText: '2026-06-26 00:00:00',
    datetimeEndText: '2026-06-26 23:59:59',
    selectType: "today",
    datetimeStartVisible: false,
    datetimeEndVisible: false,
    chartVisible: true
  },
  onLoad(options) {
    // 缓存页面this给全局变量，供外部使用
    pageThis = this;
    this.setData({
      devInfo: JSON.parse(decodeURIComponent(options.item))
    }, () => {
      // setData回调内再请求，保证devInfo已赋值
      this.toggleTimeScreen(this.data.selectType);
    })
  

  },
  showPicker(e) {
    const { mode } = e.currentTarget.dataset;
    this.setData({
      mode,
      [`${mode}Visible`]: true,
      chartVisible: false,
    });
  },
  hidePicker() {
    const { mode } = this.data;
    this.setData({
      [`${mode}Visible`]: false,
      chartVisible: true,
    }, () => {
      setTimeout(() => {
        if (chart) chart.resize()
      }, 50)
    })
  },
  onConfirm(e) {
    const { value } = e.detail;
    const { mode } = this.data;
    this.setData({
      [mode]: value,
      [`${mode}Text`]: value,
    });
    this.toggleTimeScreen(this.data.selectType);
    this.hidePicker();
  },
  onColumnChange(e) {
    console.log('pick', e.detail.value);
  },
  formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
  },
  toggleTimeScreen(e) {
    let type;
    // 区分是点击事件 还是手动传入字符串
    if (typeof e === "object" && e.currentTarget) {
      type = e.currentTarget.dataset.type;
    } else {
      type = e;
    }
    this.setData({ selectType: type });
    const now = new Date();
    let start = "";
    let end = "";
    let yesterday = "";
    switch (type) {
      case "today":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case "yesterday":
        yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
        end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
        break;
      case "beforeYesterday":
        yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
        start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
        end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
        break;
      case "custom":
        break;
    }
    if (type != "custom") {
      this.data.datetimeStartText = this.formatDate(start);
      this.data.datetimeEndText = this.formatDate(end);
    }
    this.GetNetDevInfo();
  },
  async GetNetDevInfo() {
     // 1. 更新页面data
     this.updataChart([],[],[]);
    var productId = "";
    if (this.data.devInfo.devType == 2) {
      productId = "4XgjyR6k57";
    }
    const isoStart = this.data.datetimeStartText.replace(' ', 'T');
    const isoEnd = this.data.datetimeEndText.replace(' ', 'T')
    const res = await app.deviceRequest.get("datapoint/history-datapoints", {
      product_id: productId,
      device_name: this.data.devInfo.devUuid,
      start: isoStart,
      end: isoEnd,
      limit:6000
    });
    if (res.code == 0) {
      if (res.data.count > 0) {
        if(res.data.count>5999){
          wx.showToast({ title: '每次最多显示6000条数据，请缩小时间范围继续查询', icon: 'none' })
        }
        // 提取数据
        const targetStreamT = res.data.datastreams.find(s => s.id === "T");
        const targetStreamO = res.data.datastreams.find(s => s.id === "O");
        //  const xData = targetStreamT ? targetStreamT.datapoints.map(p => p.at) : [];
         const xData = targetStreamT ? targetStreamT.datapoints.map(p => {
          return p.at.slice(0, 16);
        }) : [];
         const tempData = targetStreamT ? targetStreamT.datapoints.map(p => p.value / 10) : [];
        const openData = targetStreamO ? targetStreamO.datapoints.map(p => p.value) : [];
        // 1. 更新页面data
       this.updataChart(xData,tempData,openData);
      } else {
        wx.showToast({ title: '暂无历史数据', icon: 'none' })
      }
    } else {
      wx.showToast({ title: '数据获取失败：' + res.msg, icon: 'none' })
    }
  },
  updataChart(xData,tempData,openData){
    this.setData({ xData, tempData, openData }, () => {
      if (chart) {
        chart.setOption({
          xAxis: { data: xData },
          series: [
            { data: tempData },
            { data: openData }
          ]
        })
        chart.resize();
      }
    })
  },
  toggleScreen() {
    let flag = !this.data.isLandscape;
    this.setData({ isLandscape: flag });
    if (flag) {
      wx.setScreenOrientation({ orientation: 'landscape' });
    } else {
      wx.setScreenOrientation({ orientation: 'portrait' });
    }
    setTimeout(() => chart?.resize(), 100);
  },
  onResize() {
    if (chart) chart.resize();
  }
})