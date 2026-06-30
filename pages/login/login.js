const app = getApp();

Page({
  data: {
    formData: {}, // 存储账号密码
    showPassword: false, // 控制密码是否明文显示
  },
  onLoad(){
    console.log("token:",wx.getStorageSync("token"));
    // console.log("携带参数：",requestOptions);
    if(wx.getStorageSync("token")!=""){
      console.log("跳转页面home");
      wx.switchTab({ url: '/pages/home/home' });
    }
  },
  // 切换密码显示/隐藏
  changEye: function () {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  // 监听输入框变化
  inputChange: function (e) {
    let prop = e.currentTarget.dataset.prop // 获取 data-prop 属性 (account 或 password)
    let value = e.detail.value
    this.data.formData[prop] = value
    this.setData({
      formData: this.data.formData
    })
  },

  // 登录逻辑
  login: function () {
    let account = this.data.formData.account
    let password = this.data.formData.password

    // 1. 前端非空验证
    if (!account) {
      wx.showToast({ icon: 'none', title: "账号不能为空" })
      return
    }
    if (!password) {
      wx.showToast({ icon: 'none', title: "密码不能为空" })
      return
    }
    //  wx.redirectTo({
    //   url: '/pages/index/index'
    // })
    // 
    this.NetLogin(account,password);
  },
  // POST请求示例
  async NetLogin(account,password) {
    try { 
      const res = await app.request.post("system/APPBususer/login", {
        password: password,
        username:account,
      });
      //登录成功
      wx.setStorageSync('token', res.token);
      wx.setStorageSync('user', res.user)
      // console.log("getStorageSync", wx.getStorageSync("token"));
      wx.switchTab({ url: '/pages/home/home' });
    } catch (err) {}
  },
  // 初始化 TabBar (如果你的登录页是 TabBar 页面)
  onShow() {
    if (typeof this.getTabBar === 'function') {
      this.getTabBar()?.init();
    }
  },
   // 1. 用户点击按钮，获取微信加密手机号
   async getPhoneNumber(e) {
    // 1.1 用户拒绝授权
    if (!e.detail.code) {
      wx.showToast({ title: '取消登录', icon: 'none' })
      return
    }

    // 1.2 获取 code（传给后端换手机号）
      const PhoneCode = e.detail.code ;//兑换手机号的code
      const  OpenIdCode=await this.getLoginCode();
      const res = await app.request.post("system/APPBususer/login", {
        LoginCode: OpenIdCode.code,
        PhoneCode:PhoneCode,
      });
   //登录成功
   wx.setStorageSync('token', res.token);
   wx.setStorageSync('user', res.user)
  //  console.log("user123123", wx.getStorageSync("user"));
   // console.log("getStorageSync", wx.getStorageSync("token"));
   wx.switchTab({ url: '/pages/home/home' });
   
  },
  // 1. 封装 Promise
    getLoginCode() {
      return new Promise((resolve, reject) => {
        wx.login({
          timeout: 10000,
          success: resolve,
          fail: reject
        })
      })
    },
  register(){
 

  }
})