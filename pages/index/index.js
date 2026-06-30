Component({
  data: {
    value: 'home',
    list: [
      { value: '0', label: '首页' },
      { value: '1', label: '设备' },
      { value: '3', label: '我的' },
    ],
  },

  methods: {
    onChange(e) {
      this.setData({
        value: e.detail.value,
      });
      const value = e.detail.value;
      console.log(value);
       // 根据索引判断跳转方向
      if (value === "0") {
        wx.switchTab({ url: '/pages/home/home' });
      } 
      else if (value === 1) {
        wx.switchTab({ url: '/pages/cart/cart' });
      } 
      else if (value === 2) {
        wx.switchTab({ url: '/pages/user/user' });
      }
    },
  },
});
