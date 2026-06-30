const app = getApp()
Page({
  data: {
    navBarHeight: app.globalData.navBarHeight,
    year: 1, // 默认选中1年
    totalPrice: 35,
    deviceName: "",
    deviceId: "",
    deviceUuid:"",
    expireTime: "",
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      //console.log( JSON.parse(decodeURIComponent(options.item)) );
    var devInfo=JSON.parse(decodeURIComponent(options.item));
     this.setData({ 
      deviceName: devInfo.devName
    })
    this.setData({ 
      deviceId: devInfo.id
    }) 
    this.setData({ 
      deviceUuid: devInfo.devUuid
    }) 
    this.setData({ 
      expireTime: devInfo.expirationTime
    })
    // this.setData({ 
    //   devInfo: JSON.parse(decodeURIComponent(options.item)) 
    // })
    // this.UpdateDevTypeName();

},
  // 选择充值年限
  onYearChange(e) {
    const year = parseInt(e.detail.value);
    let totalPrice = 0;

    // 价格规则
    if (year === 1) totalPrice = 35;
    else if (year === 2) totalPrice = 60;
    else if (year === 3) totalPrice = 85;
    else if (year === 4) totalPrice = 110;
    else if (year === 5) totalPrice = 135;
    else if (year === 10) totalPrice = 260;

    this.setData({ year, totalPrice });
  },

  // 去付款
  toPay() {
    const { year, totalPrice,deviceId } = this.data;
    wx.showModal({
      title: "确认支付",
      content: `充值${year}年，金额¥${totalPrice}`,
      success: (res) => {
        if (res.confirm) {
          // 这里调用后端支付接口
           wx.showToast({ title: "跳转支付中…", icon: "loading" });
          // 1. 先调用后端接口获取支付参数
          wx.request({
            url: 'http://192.168.5.94:8181/api/wxpay/createPayOrder',
            method: 'POST',
            data: {
              openid:wx.getStorageSync("user").openid, //'用户openid',
              //orderNo: '202504200001', 后台生成了
              money:1, //totalPrice,
              rechargeLength:year,
              devId: deviceId,
              username: wx.getStorageSync("user").username,
              userId: wx.getStorageSync("user").id,
              body:"时间充值",
              desc: '时间充值'
            },
            success: res => {
              let payParam = res.data.data;
              
               // 2. 调起微信支付
              wx.requestPayment({
                timeStamp: payParam.timeStamp,
                nonceStr: payParam.nonceStr,
                package: payParam.packageValue,
                signType: payParam.signType,
                paySign: payParam.paySign,
                success: () => {
                  console.log('支付成功')
                  wx.navigateTo({
                    url: '/pages/RechargeTip/RechargeTip'
                  })
                },
                fail: () => {
                  wx.showToast({ title: "支付失败！", icon: "none" });
                }
              })
            }
          })
        }
      },
    });
  },
});