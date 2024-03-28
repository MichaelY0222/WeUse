// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    wx.setStorageSync('showDebug', false)
    wx.setStorageSync('isLoggedIn', false)
  },
  globalData: {
    userInfo: null
  }
})
