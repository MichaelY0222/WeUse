// app.js
App({
  onLaunch() {
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
