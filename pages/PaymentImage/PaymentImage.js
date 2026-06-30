 
const app = getApp()
const config = require("../../utils/config.js");
Page({
  data: {
    navBarHeight: app.globalData.navBarHeight,
    imageUrl: "",
    hasImage: false,
    files: [],
    customUpload: true
  },

  onLoad() {
    this.getImageInfo();
  },

  // 手动触发选择图片（解决文字不显示问题）
  triggerUpload() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const path = res.tempFilePaths[0]
        this.doUpload(path)
      }
    })
  },

  // 更换图片
  onChangeImage() {
    this.triggerUpload()
  },

  // 执行上传到若依
  doUpload(filePath) {
    wx.showLoading({ title: '上传中...' })
    wx.uploadFile({
      url: config.baseUrl+ "/system/APPBususer/upload",//"https://你的域名/common/upload",
      filePath: filePath,
      name: "file",
      header: { Authorization: wx.getStorageSync("token")},
      success: (res) => {
        const result = JSON.parse(res.data)
        if (result.code === 200) {
           this.setData({
            files: [{ url: result.data.url }],
            hasImage: true,
            imageUrl: result.data.url
          })
        } else {
          this.selectComponent("#t-toast").show({ message: result.msg, theme: "error" })
        }
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  // 查询已有图片
  getImageInfo() {
    wx.showLoading({ title: "加载中..." })
    wx.request({
      url:  config.baseUrl+"/system/APPBususer/GetAppUserInfo",
      method: "GET",
      header: { Authorization: wx.getStorageSync("token") },
      success: (res) => {
         if (res.data.code === 200 ) {
          const url = config.baseUrl+res.data.data.paymentImage;
          this.setData({
            imageUrl: url,
            hasImage: true,
            files: [{ url }]
          })
        } else {
          this.setData({ hasImage: false, files: [], imageUrl: "" })
        }
      },
      complete: () => wx.hideLoading()
    })
  },

  
})