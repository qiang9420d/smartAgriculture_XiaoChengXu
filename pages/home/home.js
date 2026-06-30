// pages/home/home.js
const app = getApp()
 
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight,
    activeTab:"0",
    DevList:[]//设备列表
 
  },
 
    onTabsChange(event) {
        // console.log(`Change tab, tab-panel value is ${event.detail.value}.`);
      this.setData({ activeTab: event.detail.value })
      this.GetDevList(event.detail.value);
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
    this.GetDevList("0");

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
     this.GetDevList(this.data.activeTab);
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

  },
  async GetDevList(devType){ 
    const res = await app.request.post("system/APPBususer/getDevList", { 
      devType:devType  
    });   
    
    // this.DevList=res;
    this.setData({
      DevList: res
    })
   // this.GetDevOnline(0);
    //this.GetSwitch(0);
   // this.GetAlarm(0);
    this.GetNetDevInfo();
  },
  //获取在线状态，应该去请求移动接口获取状态
  GetDevOnline(id){
    var TempData=[];
      this.data.DevList.forEach((item, index) => {
        // console.log('索引：', index, '值：', item);
        if(id!=0){
             console.log('指定');
            item.isOnline=true; 
        }else{
          console.log('非指定');
          item.isOnline=false; 
        }
        TempData.push(item);
      });
      this.setData({
        DevList: TempData
      })
      //console.log('this.DevList',this.data.DevList);
  },
    //获取在线状态，应该去请求移动接口获取状态
  GetAlarm(id){
      var TempData=[];
      this.data.DevList.forEach((item, index) => {
        // console.log('索引：', index, '值：', item);
        if(id!=0){
            console.log('指定');
            item.Alarm=true; 
            item.AlarmType="0";
        }else{
          console.log('非指定');
          item.Alarm=false; 
          item.AlarmType="1";
        }
        TempData.push(item);
      });
      this.setData({
        DevList: TempData
      })
      console.log('this.DevList',this.data.DevList);
  },
    //获取的开关状态，应该去请求移动接口获取状态
   GetSwitch(id){
      var TempData=[];
      this.data.DevList.forEach((item, index) => {
        // console.log('索引：', index, '值：', item);
        if(id!=0){
            console.log('指定');
            item.switchState=true; 
        }else{
          console.log('非指定');
          item.switchState=false; 
        }
        TempData.push(item);
      });
      this.setData({
        DevList: TempData
      })
      //console.log('this.DevList',this.data.DevList);
  },

  async GetNetDevInfo(){
    var TempData=[];
    const list = this.data.DevList
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      var productId="";
      if(item.devType==2){
        productId="4XgjyR6k57";
      }
      item.isOnline=false;//设备不在线
      const resdata = await app.deviceRequest.get("device/detail", { 
        product_id:productId, 
        device_name:item.devUuid
        });  
        if(resdata.code==0){
            if(resdata.data.status==1){
              item.isOnline=true;//设备在线
            }else{
              item.isOnline=false;//设备不在线
            }
        }
      const res = await app.deviceRequest.get("datapoint/history-datapoints", { 
        product_id:productId, 
        device_name:item.devUuid
        });   
        if(res.code==0){
          item.isOnline=true;//设备在线
          if(res.data.count==5){ 
            var VER=res.data.datastreams[0].datapoints[0].value;
            var S=res.data.datastreams[1].datapoints[0].value;
            var T=res.data.datastreams[2].datapoints[0].value;
            var ALARM=res.data.datastreams[3].datapoints[0].value;
            var O=res.data.datastreams[4].datapoints[0].value;
            item.workingMode=S; //工作模式 s=5 显示自动，S=4显示手动
            item.temperature=T/10;//温度
            item.openDegree=O; //开度，厘米
            if(ALARM==0){
              ALARM=false;
            }else{
              ALARM=true;
            }
            item.Alarm=ALARM;//温度
          }else{
            wx.showToast({ title: '设备状态接口数据获取失败！'+res.msg, icon: 'none' })
          }
        }else if(res.code==10410){//获取设备数据失败:设备不存在
          item.isOnline=false;//设备在线
          item.workingMode=1; //工作模式 s=5 显示自动，S=4显示手动
          item.temperature="-";
          item.openDegree="-";
        }
       
       // console.log("执行TempData.push");

        TempData.push(item);
    };
    this.setData({
      DevList: TempData
    })
   
   },
  ManualSwitch(value){
    // this.setData({ activeTab: "0"})
    this.setData({ activeTab: value })
    this.GetDevList(value);
  },
  EquipmentDetails(e){
       // e 是事件对象，所有参数都在 e.currentTarget.dataset 里
       console.log("点击参数：", e.currentTarget.dataset);
        wx.navigateTo({
            url: '/pages/EquipmentDetails_switch/EquipmentDetails_switch?item='+encodeURIComponent(JSON.stringify(e.currentTarget.dataset.item))
          })
  },
     // 开关变化事件
     onSwitchChange(e) {
      const value = e.detail.value;
      const id = e.currentTarget.dataset.id;
      console.log("id", id);
      console.log("电源开关状态：", value ? "开启" : "关闭");
    },
    onSetting(e){
      
      //console.log("item", e.currentTarget.dataset.item);
      wx.navigateTo({
        url: '/pages/DeviceSetting/DeviceSetting?item='+encodeURIComponent(JSON.stringify(e.currentTarget.dataset.item))
      })
    },
    //充值
    onRecharge(e){
      
      //console.log("item", e.currentTarget.dataset.item);
      wx.navigateTo({
        url: '/pages/Recharge/Recharge?item='+encodeURIComponent(JSON.stringify(e.currentTarget.dataset.item))
      })
    }
})   