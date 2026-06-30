Component({
  //  组件的属性列表
  properties: { },
  //  组件的初始数据
  data: {
    value: '/pages/home/home',
    tabBar: [{
      value: '/pages/home/home',
      icon: 'home',
      label: '首页',
    }, 
    {
      value: "/pages/ProxyHome/ProxyHome",
      icon: 'task',
      label: "代理"
    },
    {
      value: '/pages/user/user',
      icon: 'user-1',
      label: '我的',
    }]
  },
  //  组件的方法列表
  methods: {
    onChange(e) {
      wx.switchTab({
        url: e.detail.value
      });
    }
  }
})
