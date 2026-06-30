// pages/DeviceSetting/DeviceSetting.js
const app = getApp()
import ActionSheet, { ActionSheetTheme } from 'tdesign-miniprogram/action-sheet/index';
 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight,
    showSheet: false,
    overlayVisible: false,//排湿弹出层
    overlayVisible2:false,//手动开到指定开度弹出层
    sheetItems: [
      { label: '开关' },
      { label: '放风机' },
      { label: '环境监测' },
      { label: '卷帘机' }
    ],
    devInfo:null,
    devTypeName:"",
    dialogKey: '',
    showWithInput: false,
    showTextAndTitleWithInput: false,
    RunModel:0,//当前运行模式 0=自动 1=手动
    // ======================
    // 时间选择变量（完整6个）
    // ======================
    morningStartTime: "06:00",
    morningEndTime: "10:00",
    noonStartTime: "11:00",
    noonEndTime: "14:00",
    nightStartTime: "17:00",
    nightEndTime: "21:00",

   // 时间选择器
   showPicker: false,
   pickerValue: "06:00", // 选择器当前值
   currentField: "",
   startTime: new Date().setHours(0, 0, 0, 0), //起始时间
    // ======================
    // 温度设置4个
    // ======================
    morningTemperature:0,//早上温度
    noonTemperature:0,//中午温度
    nightTemperature:0,//晚上温度
    CloseTemperature:0,//关闭温度
    // ======================
    // 报警温度设置2个
    // ======================
    HighTemperatureAlarm:0,//高温报警
    LowTemperatureAlarm:0,//低温报警
    // ======================
    // 排湿相关参数
    // ======================
    DampnessOpen:0,//排湿开度
    RemovalDuration:0,//排湿持续时间
    ManualAngle:0,//手动角度
  },
  showSheet() {
    this.setData({ showSheet: true });
  },

  onItemClick(e) {
    // console.log(e.detail);
    // 选中后自动关闭
    this.setData({ showSheet: false });
    this.data.devInfo.devType=e.detail.index+1;
    this.UpdateDevTypeName();
    this.UpdateDataNet();
  },

  // 点击取消/遮罩层关闭
  onSheetClose() {
    this.setData({ showSheet: false });
  },
  showDialog(e) {
    const { key } = e.currentTarget.dataset;
    this.setData({ [key]: true, dialogKey: key });
  },

  closeDialog() {
     const { dialogKey } = this.data;
     this.setData({ [dialogKey]: false });
  },
  confirmgDialog() {
    const { dialogKey } = this.data;
    // console.log( this.data);
    this.setData({ [dialogKey]: false });
    this.setData({ 
      devInfo:this.data.devInfo
    })
    this.UpdateDataNet();
  },
  onInputChange(e) {
    // console.log(e.detail.value);
    this.data.devInfo.devName=e.detail.value;

  },
  async UpdateDataNet(){
    const res = await app.request.post("system/APPBususer/EditDev", {
      id: this.data.devInfo.id,
      devName: this.data.devInfo.devName,
      devType:this.data.devInfo.devType,
    });
    app.$toast({ context: this, selector: '#t-toast', message: '修改成功', theme: 'success' });
  },
  async DeleteDataNet(){
    const res = await app.request.post("system/APPBususer/RemoveDev", {
      id: this.data.devInfo.id,
    });
    app.$toast({ 
      context: this, 
      selector: '#t-toast', 
      message: '删除成功', 
      theme: 'success',
      preventScrollThrough: true,//遮罩层
      onClose() {
        console.log("toast 消失后执行");
        // ✅ toast 消失后执行
        // 获取页面栈
        const pages = getCurrentPages();
        console.log("toast 消失后执行1");
        // 上一页 = A页面
        const prevPage = pages[pages.length - 2];
        console.log("toast 消失后执行2");
        prevPage.ManualSwitch("0");
        console.log("toast 消失后执行3");
        wx.navigateBack();
        console.log("toast 消失后执行4");
      },
      destroy(){
        console.log("toast 消失后执行123");
      }
    });
    
  },
  DeleteDevConfirm(e){
    // console.log(e.currentTarget.dataset.item);
    this.DeleteDataNet();
  },
  DeleteDevCloseDialog(e){
    const { dialogKey } = this.data;
    this.setData({ [dialogKey]: false });
  },
  SwitchModeConfirm(e){
    var cmd = `cmd:05,data:00`;
    var ist =this.DevApiNet(cmd);
    if(ist){
      this.DeleteDevCloseDialog(e);
      wx.showToast({ title: "已切换为自动模式！", icon: 'none' })
    }
    // console.log("切换模式");
  },
ShowOverlayClick() {
    this.setData({ overlayVisible: true });
  },
HideOverlayClick(e) {
     this.setData({
      overlayVisible: false,
    });
  },
   //手动开指定度数
   ManuallyOpen(){
    var cmd = `cmd:06,data:${this.data.ManualAngle}`;
    var ist =this.DevApiNet(cmd);
    if(ist){
      this.setData({ overlayVisible2: false });
      wx.showToast({ title: "手动开启成功！", icon: 'none' })
    }
  },
  //排湿
  DampnessElimination(){
    var cmd = `cmd:04,tim:${this.data.RemovalDuration},deg:${this.data.DampnessOpen}`;
    var ist =this.DevApiNet(cmd);
    if(ist){
      this.HideOverlayClick(null);
      wx.showToast({ title: "排湿开启成功！", icon: 'none' })
    }
  },
  //确定修改信息
  async ConfirmChanges(){
    var cmd = `cmd:07,low: ${this.data.LowTemperatureAlarm}, hgi:${this.data.HighTemperatureAlarm}, cls:${this.data.CloseTemperature}, mor:${this.data.morningTemperature}, non:${this.data.noonTemperature}, nit:${this.data.nightTemperature}`;
    var ist =await this.DevApiNet(cmd);
    cmd = `cmd:08,mrs:${this.data.morningStartTime},mre:${this.data.morningEndTime},nos:${this.data.noonStartTime},noe:${this.data.noonEndTime},nis:${this.data.nightStartTime},nie:${this.data.nightEndTime}`;
     ist =await this.DevApiNet(cmd);
    if(ist){
      wx.showToast({ title: "修改成功！", icon: 'none' })
    }

  },
  // 早上温度
onMorningTempChange(e) {
  this.setData({
    morningTemperature: e.detail.value
  })
},
// 中午温度
onNoonTempChange(e) {
  this.setData({
    noonTemperature: e.detail.value
  })
},
// 晚上温度
onNightTempChange(e) {
  this.setData({
    nightTemperature: e.detail.value
  })
},
// 关闭温度
onCloseTempChange(e) {
  this.setData({
    CloseTemperature: e.detail.value
  })
},
// 高温报警
onHighTempAlarmChange(e) {
  this.setData({
    HighTemperatureAlarm: e.detail.value
  })
},
// 低温报警
onLowTempAlarmChange(e) {
  console.log(e.detail.value);
  this.setData({
    LowTemperatureAlarm: e.detail.value
  })
},
// 开度赋值
onDampnessChange(e) {
  this.setData({
    DampnessOpen: e.detail.value
  })
},
// 开度赋值
onManualAngleChange(e) {
  this.setData({
    ManualAngle: e.detail.value
  })
},
// 时长赋值
onDurationChange(e) {
  this.setData({
    RemovalDuration: e.detail.value
  })
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      this.setData({ 
        devInfo: JSON.parse(decodeURIComponent(options.item)) 
      })
      this.UpdateDevTypeName();
 
  },
UpdateDevTypeName(){
  //1=开关 2=放风机 3=环境监测 4=卷帘机
  if(this.data.devInfo.devType=="1"){
    this.setData({ 
      devTypeName: "开关"
    })
  } else if(this.data.devInfo.devType=="2"){
    this.setData({ 
      devTypeName: "放风机"
    })
  }else if(this.data.devInfo.devType=="3"){
    this.setData({ 
      devTypeName: "环境监测"
    })
  }else if(this.data.devInfo.devType=="4"){
    this.setData({ 
      devTypeName: "卷帘机"
    })
  }
},

  // ======================================
  // 点击 cell → 弹出时间选择器
  // ======================================
  showTimePicker(e) {
    const field = e.currentTarget.dataset.field;
    const currentTime = this.data[field]; // 取出当前cell的时间

    // console.log("field",field);
    this.setData({
      showPicker: true,
      currentField: field,
      pickerValue: currentTime, // 关键：把当前时间赋值给选择器！

    });
  },

  // ======================================
  // 滑动选择（实时）
  // ======================================
  onTimeChange(e) {
    // 可空
  },

  // ======================================
  // 确认选择 → 自动回填到对应项
  // ======================================
  onTimeConfirm(e) {
    const [h, m] = e.detail.value;
     const timeStr = e.detail.value;//`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    //  console.log("timeStr",timeStr);

    this.setData({
      [this.data.currentField]: timeStr,
      showPicker: false
    });
  },

  // ======================================
  // 取消选择
  // ======================================
  onTimeCancel() {
    this.setData({ showPicker: false });
  },
 async DevApiNet(commandStr){
  console.log(commandStr)
    var productId="";
    if( this.data.devInfo.devType==2){
     productId="4XgjyR6k57";
   }
    const res = await app.deviceRequest.post("datapoint/synccmds?product_id="+productId+"&device_name="+ this.data.devInfo.devUuid+"&timeout=6",
    commandStr,
      {
        header: {
          "content-type": "application/plain"
        }
      }
    );
    if(res.code==0){
        return true;
    }else{
      wx.showToast({ title: res.msg, icon: 'none' })
      return false;
    }
   
  }, 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

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