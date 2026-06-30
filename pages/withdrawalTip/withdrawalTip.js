const app = getApp()
Page({
  data: {
    navBarHeight: app.globalData.navBarHeight,
 
  },
  /**
   * 返回订单列表页面
   */
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },
  /**
   * 跳转首页
   */
  goHome() {
    wx.switchTab({
      url: "/pages/index/index"
    })
  }
})