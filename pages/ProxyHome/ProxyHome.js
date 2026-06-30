// pages/ProxyHome/ProxyHome.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight,
    com_withdraw_commission_sum:0,
    ing_withdraw_commission_sum:0,
    un_withdraw_commission_sum:0,
    dev_Count:0,
    checkAmountCount:0,
    selectType:0,//金额选择类型
    isAgent:wx.getStorageSync("user"),//是否是代理
    DevList:[],//设备列表
    BusWithdrawaList:[]//提现、累计提现、拒绝提现列表

  },
  async SendNetBingDev(DevUuid,ProxyUser){
    const res = await app.request.post("system/APPBususer/BindingAgent", {
      devUuid:DevUuid, //"12408348571",
      proxyUser:ProxyUser,
    });
    this.showToast('绑定成功！');
    this.handleDevList(1,0);
   },
   chooseImageScan() {
    var that=this;
    wx.scanCode({
      // 【关键配置】
      // false: 允许用户选择“拍照”或“从相册选择”
      // true: 仅允许调用摄像头
      onlyFromCamera: false, 
      
      // 指定扫码类型，提高识别准确率
      scanType: ["qrCode", "barCode"], 
      
      success: (res) => {
        //console.log('扫码成功', res.result);
        
        // this.setData({
        //   scanResult: res.result,
        //   scanType: this.getTypeName(res.scanType)
        // });
        
        wx.vibrateShort({ type: 'success' });
        // this.showToast('识别成功');
        if(res.result.split(";").length>1){
          var  DeviceId=res.result.split(";")[0].replace(/\s+/g, '');
          this.SendNetBingDev(DeviceId,wx.getStorageSync('user').id);
        }else{
          this.showToast('二维码不正确');
        }
       
      },
      fail: (err) => {
        // 用户取消操作或授权失败时触发
        if (err.errMsg && err.errMsg.includes('cancel')) {
          console.log('用户取消扫码');
        } else {
          this.showToast('扫码失败，请检查权限');
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.handleDevList(1,0);
    this.getWithdrawalAmountVo();
  },
      //跳转二维码维护界面
      onNavigateTo(e){
      
        //console.log("item", e.currentTarget.dataset.item);
        wx.navigateTo({
          url: '/pages/PaymentImage/PaymentImage'
        })
      },
      //金额类型选择
  selectTypeHandler(e){
    const type = e.currentTarget.dataset.type
    this.setData({ selectType: type })
    if(type==0){
      this.handleDevList(1,0);//未提现
    }
   else if(type==1){
      // this.handleDevList(1,1);//提现中
      this.GetBusWithdrawalByUserID();
    }
    else if(type==2){
      // this.handleDevList(1,2);//提现完成
      this.GetBusWithdrawalByUserID();
    }else if(type==3){
      this.getDevListByproxyUser();//设备总数
    }
  },
  //获取提现中和拒绝提现和累计提现金额的数据详细
  async GetBusWithdrawalByUserID(){
    const res = await app.request.post("system/APPBususer/GetBusWithdrawalByUserID", { 
    });  
    if(this.data.selectType==1){
      const filterData = res.filter(item => item.state === 0||item.state === 2)
      this.setData({
        BusWithdrawaList: filterData
      })
    }else if(this.data.selectType==2){
      const filterData = res.filter(item => item.state === 1)
      this.setData({
        BusWithdrawaList: filterData
      })
    }

    // this.setData({
    //   BusWithdrawaList: res
    // })
     //console.log("this.data.BusWithdrawaList",this.data.BusWithdrawaList);
  },

      // 点击触发入口
  GetDevList(e) {
    const ds = e.currentTarget.dataset;
    const a = Number(ds.a);
    const b = Number(ds.b);
    
      this.setData({
        selectType: b
      })
   
    // 调用真正的异步逻辑
    this.handleDevList(a, b);
  },
  async handleDevList(a,b){  
    if(wx.getStorageSync("user").isAgent==0){
      this.setData({
        isAgent: false
      })
    }else{
      this.setData({
        isAgent: true
      })
    }
    this.getWithdrawalAmountVo();
    const res = await app.request.post("system/APPBususer/ListVoByProxyUser", { 
        openid: wx.getStorageSync('user').id,
        state:a, //0=未支付 1=支付成功 2=支付失败
        withdrawalStatus:b //0=未提现 1=提现中 2=提现完成 
      });   
 
    res.forEach(item => {
      item.checked = false
    })
    this.setData({
      DevList: res
    })
 
  },
  async getWithdrawalAmountVo(){
    const res = await app.request.post("system/APPBususer/getWithdrawalAmountVoByProxyUser", { 
      openid: wx.getStorageSync('user').id,
    });   
    if(res.length >0){
      this.setData({
        com_withdraw_commission_sum: res[0].com_withdraw_commission_sum
      })
      this.setData({
        ing_withdraw_commission_sum: res[0].ing_withdraw_commission_sum
      })
      this.setData({
        un_withdraw_commission_sum: res[0].un_withdraw_commission_sum
      })
      this.setData({
        dev_Count: res[0].dev_Count
      })
    }
   
  },
  //提现申请
  async NetWithdrawal(){
    let arr = [];
    this.data.DevList.forEach(item => {
      if(item.checked){
        arr.push(item.id);
      }
    })
    if(arr.length<=0){
      wx.showToast({ title: '请选择需要提现的数据', icon: 'none' })
      return;
    }
    const res = await app.request.post("system/APPBususer/BusWithdrawalAdd", { 
      PayOrderId:arr// 直接添加数组字段
    });   
  
    if (res  > 0 ) {
     
      this.handleDevList(1,0);//刷新
      this.getWithdrawalAmountVo();//刷新
      wx.navigateTo({
        url: '/pages/withdrawalTip/withdrawalTip'
      })
    } else {
      
    }
  },
//通过代理人ID，获取所有设备
async getDevListByproxyUser(){
    const res = await app.request.post("system/APPBususer/getDevListByproxyUser", { 
      proxyUser:wx.getStorageSync('user').id,// 直接添加数组字段
    });  
    this.setData({
      DevList: res
    })
  },
  SetChecked(e){
      // 获取点击下标
  const index = e.currentTarget.dataset.index
  // 拷贝数组，不要直接修改原数据
  const list = [...this.data.DevList]
  // 当前点击的item
  const currentItem = list[index]
 if(currentItem.withdrawalStatus!=0){
    return;
 }
  // 切换选中状态（多选）
  list[index].checked = !list[index].checked

  // 如果是单选，先全部置false，再选中当前
  // list.forEach(item => item.checked = false)
  // list[index].checked = true

  this.setData({
    DevList: list
  })
  this.CalculateChecked()
  },
  CalculateChecked(){
    var amountCount=0;
    this.data.DevList.forEach(item => {
       if(item.checked){
        amountCount+=item.commissionAmount
      }
    })
    this.setData({
      checkAmountCount: amountCount
    })
    
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      const page = getCurrentPages().pop();
      this.getTabBar().setData({
        value: '/' + page.route
      })
    }
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})