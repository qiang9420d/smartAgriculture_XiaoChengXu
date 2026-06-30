const config = require("./config.js");

class Request {
  constructor() {
    // 基础配置
    this.baseUrl = config.businessAPIUrl;
    this.timeout = config.timeout;
    this.header = config.header;
    // 请求队列（防止多次loading）
    this.requestQueue = [];
  }

  /**
   * 核心请求方法
   * @param {Object} options 请求参数
   */
  request(options) {
    // 1. 请求拦截处理
    const requestOptions = this.interceptors.request(options);

    return new Promise((resolve, reject) => {
      // 2. 显示loading（可选）
      this.showLoading();
console.log("携带参数：",requestOptions);
      // 3. 发起微信请求
      wx.request({
        ...requestOptions,
        url: this.baseUrl + requestOptions.url,
        timeout: this.timeout,
        header: {
          ...this.header,
          ...requestOptions.header,
        },
        // 请求成功
        success: (res) => {
          // 响应拦截处理
          const result = this.interceptors.response(res);
          console.log(result);
          if (result.code === 200) {
            // 接口成功
            resolve(result.data);
          } else {
            // 接口业务错误
            this.handleError(result.code, result.msg || "请求失败");
            reject(result);
          }
        },
        // 请求失败（网络/超时等）
        fail: (err) => {
          this.handleError(-1, "网络异常，请稍后重试");
          reject(err);
        },
        // 请求完成
        complete: () => {
          // 隐藏loading
          this.hideLoading();
        },
      });
    });
  }

  /**
   * 拦截器
   */
  get interceptors() {
    return {
      // 请求拦截：统一处理token、参数等
      request: (options) => {
        // 从缓存获取token
        const token = wx.getStorageSync("token");
        if (token) {
          options.header = {
            ...options.header,
            // Authorization: `Bearer ${token}`, // 按后端要求修改
            Authorization: `${token}`, // 按后端要求修改
          };
        }
        return options;
      },
      // 响应拦截：统一处理返回数据格式
      response: (res) => {
        return res.data || {};
      },
    };
  }

  /**
   * 统一错误处理
   */
  handleError(code, msg) {
    wx.showToast({
      title: msg,
      icon: "none",
      duration: 2000,
    });

    // 状态码特殊处理
    if (code === 401) {
      // token过期/未登录
      wx.clearStorageSync();
      wx.navigateTo({
        url: "/pages/login/login",
      });
    }
  }

  /**
   * loading 管理（防止多个请求闪烁）
   */
  showLoading() {
    if (this.requestQueue.length === 0) {
      wx.showLoading({
        title: "加载中...",
        mask: true,
      });
    }
    this.requestQueue.push("request");
  }

  hideLoading() {
    this.requestQueue.pop();
    if (this.requestQueue.length === 0) {
      wx.hideLoading();
    }
  }

  /**
   * 快捷方法：GET
   */
  get(url, data = {}, options = {}) {
    return this.request({
      url,
      method: "GET",
      data,
      ...options,
    });
  }

  /**
   * 快捷方法：POST
   */
  post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: "POST",
      data,
      ...options,
    });
  }

  /**
   * 快捷方法：PUT
   */
  put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: "PUT",
      data,
      ...options,
    });
  }

  /**
   * 快捷方法：DELETE
   */
  delete(url, data = {}, options = {}) {
    return this.request({
      url,
      method: "DELETE",
      data,
      ...options,
    });
  }
}

// 单例模式导出
module.exports = new Request();