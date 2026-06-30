const app = getApp()
Component({
  properties: {
    title: { type: String, value: '' },
    bgColor: { type: String, value: '#fff' },
    titleColor: { type: String, value: '#333' },
    showBack: { type: Boolean, value: true },
    showAdd: { type: Boolean, value: false },
    showHome: { type: Boolean, value: false }
  },
  data: {
    statusBarHeight: app.globalData.statusBarHeight,
    navBarHeight: app.globalData.navBarHeight,
    menuButton: app.globalData.menuButtonRect
  },
  methods: {
    onBack() {
      const pages = getCurrentPages()
      if (pages.length >1) {
        wx.navigateBack({ delta: 1 })
      }
      else{
        wx.switchTab({ url: '/pages/home/home' })
      } 
    },
    onHome() {
      wx.switchTab({ url: '/pages/home/home' })
    },
    onAdd() {
      this.chooseImageScan();
      // wx.redirectTo({
      //   url: '/pages/scan/scan'
      // })
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
          console.log('扫码成功', res.result);
          
          // this.setData({
          //   scanResult: res.result,
          //   scanType: this.getTypeName(res.scanType)
          // });
          
          wx.vibrateShort({ type: 'success' });
          // this.showToast('识别成功');
          if(res.result.split(";").length>1){
            var  DeviceId=res.result.split(";")[0].replace(/\s+/g, '');
            var  DeviceTypeId=res.result.split(";")[1].replace(/\s+/g, '');
            DeviceTypeId=1;
            var  DeviceName="";
            var Type=0;//新增
            var max=1000;
            var min=9999;
            if(DeviceTypeId=="1"){
              DeviceName="开关"+Math.floor(Math.random() * (max - min + 1)) + min;
            }else if(DeviceTypeId=="2"){
              DeviceName="放风机"+Math.floor(Math.random() * (max - min + 1)) + min;
            }else if(DeviceTypeId=="3"){
              DeviceName="环境监测"+Math.floor(Math.random() * (max - min + 1)) + min;
            }else if(DeviceTypeId=="4"){
              DeviceName="卷帘机"+Math.floor(Math.random() * (max - min + 1)) + min;
            }
            DeviceName="设备名称"+Math.floor(Math.random() * (max - min + 1)) + min;
            wx.navigateTo({
              url: `/pages/InsertDevice/InsertDevice?DeviceId=${DeviceId}
              &DeviceName=${DeviceName}&DeviceTypeId=${DeviceTypeId}&Type=${Type}`
            })
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
    }
  }
})