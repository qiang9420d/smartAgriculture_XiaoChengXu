Component({
  data: {
    // 控制开关的变量：true 开 / false 关
    switchStatus: true,
  },
  methods: {
     // 开关变化事件
    onSwitchChange(e) {
      const value = e.detail.value;
      console.log("电源开关状态：", value ? "开启" : "关闭");
      // this.setData({
      //   switchStatus: value
      // });+
       // 弹出确认框
    wx.showModal({
      title: '确认切换',
      content:value ? '确定开启开关吗？' : '确定关闭开关吗？',
      success: (res) => {
        if (res.confirm) {
          // 确定：更新开关
          this.setData({
            switchStatus: value
          });
        } else {
          // 取消：不更新，保持原样
          console.log('用户取消');
        }
      }
    });
    },
 
  }
});