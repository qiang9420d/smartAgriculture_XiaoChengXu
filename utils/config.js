// 接口基础配置
module.exports = {
  // 基础请求地址（根据环境切换）
  businessAPIUrl: "http://192.168.5.94:8181/", //业务系统API地址
  DevAPIUrl:"http://iot-api.heclouds.com/", //设备API地址
  // 请求超时时间
  timeout: 10000,
  // 请求头
  header: {
    "Content-Type": "application/json",
  },
};