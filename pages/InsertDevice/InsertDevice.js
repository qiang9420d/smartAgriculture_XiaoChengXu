const app = getApp();

Page({
  data: {
    navBarHeight: app.globalData.navBarHeight,
    isEdit: false,//修改还是新增
    form: {
      DeviceName: '',    // 设备名称
      DeviceId: '',      // 设备ID（禁用）
      DeviceTypeId:'',     //设备类型
    }
  },

  onLoad(options) {
    // console.log('接收参数：', options);

    if (options.Type == 0) {
      // 新增模式
      this.setData({
        isEdit: false,
        form: {
          DeviceId: options.DeviceId.replace(/\s+/g, '') || '',
          DeviceName: options.DeviceName.replace(/\s+/g, '') || '',
          DeviceTypeId: options.DeviceTypeId.replace(/\s+/g, '') || '',
        }
      })
// console.log("this.data.form",this.data.form);
      wx.setNavigationBarTitle({ title: '新增设备' })
    } else {
      // 编辑模式
      this.setData({
        isEdit: true,
        form: {
          DeviceId: options.DeviceId || '',
          DeviceName: options.DeviceName || '',
          DeviceTypeId: options.DeviceTypeId || '',
        }
      })
      wx.setNavigationBarTitle({ title: '修改设备' })
    }
  },

  // ✅ 设备名称输入（字段名修正）
  onNameChange(e) {
    this.setData({
      'form.DeviceName': e.detail.value
    })
  },
  // 选择 RADIO 自动赋值
  onDeviceTypeChange(e) {
    this.setData({
      'form.DeviceTypeId': e.detail.value
    })
  },

  // ========= 提交（修复字段名） =========
  submitAdd() {
    const { DeviceName, DeviceId,DeviceTypeId } = this.data.form;

    if (!DeviceName) {
      return app.$toast({ context: this, selector: '#t-toast', message: '请输入设备名称', theme: 'error' })
    }
    if (!DeviceId) {
      return app.$toast({ context: this, selector: '#t-toast', message: '请输入设备ID', theme: 'error' })
    }
    if (!DeviceTypeId) {
      return app.$toast({ context: this, selector: '#t-toast', message: '请选择设备类型', theme: 'error' })
    }
   
    // setTimeout(() => wx.navigateBack(), 1200)
    this.NetAdd();
    // this.getData();
  },
    // GET请求示例
    async getData() {
      try {
        const res = await app.request.get("system/APPBususer/getDevList", { page: 1, size: 10 });
        console.log("请求成功：", res);
        // 业务处理...
      } catch (err) {
        console.log("请求失败：", err);
      }
    },
  async NetAdd(){
   
    try { 
      const { DeviceName, DeviceId,DeviceTypeId } = this.data.form;
      const user = wx.getStorageSync("user");
      console.log("user",user);
      const res = await app.request.post("system/APPBususer/add", {
        devName: DeviceName,
        devUuid:DeviceId,
        devType:DeviceTypeId,
        belongUserid:user.id
      });
      app.$toast({ context: this, selector: '#t-toast', message: '新增成功', theme: 'success' });
      // 获取页面栈
      const pages = getCurrentPages();
      // 上一页 = A页面
      const prevPage = pages[pages.length - 2];

      // 直接调用A页面的刷新方法
      // prevPage.activeTab=0;
        prevPage.ManualSwitch("0");

      wx.navigateBack();
    } catch (err) {}
  },
  submitEdit() {
    const { DeviceName, DeviceId,DeviceTypeId } = this.data.form;

    if (!DeviceName) {
      return app.$toast({ context: this, selector: '#t-toast', message: '请输入设备名称', theme: 'error' })
    }
    if (!DeviceId) {
      return app.$toast({ context: this, selector: '#t-toast', message: '请输入设备ID', theme: 'error' })
    }
    if (!DeviceTypeId) {
      return app.$toast({ context: this, selector: '#t-toast', message: '请选择设备类型', theme: 'error' })
    }

    app.$toast({ context: this, selector: '#t-toast', title: '修改成功', theme: 'success' })
    setTimeout(() => wx.navigateBack(), 1200)
  },

  // goBack() {
  //   wx.navigateBack()
  // }
})