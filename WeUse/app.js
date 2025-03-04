// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    const showDebug = wx.getStorageSync('showDebug') || false
    wx.setStorageSync('showDebug', showDebug)
  },
  globalData: {
    userInfo: null
  }
})
