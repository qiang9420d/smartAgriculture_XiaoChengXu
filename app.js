// app.js
import Toast from 'tdesign-miniprogram/toast/index';
const request = require("./utils/request.js");
const deviceRequest = require("./utils/deviceRequest.js");

App({
  onLaunch() {
    
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    request,
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
   // 直接写在 App 内部 → 这是最不会报错的写法！
   $toast(options) {
    // 兼容 文字 / 对象 两种写法
    if (typeof options === 'string') {
      options = { title: options };
    }

    return Toast({
      context: this,
      selector: '#t-toast',
      ...options,
    });
  },
  globalData: {
    statusBarHeight: 0, // 状态栏高度（刘海/挖孔）
    navBarHeight: 0,    // 自定义导航栏总高度（状态栏+内容区）
    menuButtonRect: {}  // 胶囊按钮位置信息
  },
  request,
  deviceRequest,
  onLaunch() {
    const systemInfo = wx.getSystemInfoSync()
    const menuButton = wx.getMenuButtonBoundingClientRect() // 胶囊API
    this.globalData.statusBarHeight = systemInfo.statusBarHeight
    // 计算导航栏总高度 = 胶囊高度 + 胶囊上下边距（适配所有机型）
    this.globalData.navBarHeight = menuButton.height +  menuButton.top+10 
    // this.globalData.navBarHeight = menuButton.height + (menuButton.top - systemInfo.statusBarHeight) * 2
    // this.globalData.navBarHeight =this.globalData.navBarHeight ;
    console.log(menuButton.height );
    console.log(menuButton.top);
    console.log( systemInfo.statusBarHeight );
    this.globalData.menuButtonRect = menuButton
  },
})
