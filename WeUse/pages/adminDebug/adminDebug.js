// pages/adminDebug/adminDebug.js
Page({

  /**
   * Page initial data
   */
  data: {
    showDebugInfo: false,
    opDone: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: async function(options) {
    this.setData({
      showDebugInfo: wx.getStorageSync('showDebug'),
    });
    await wx.cloud.callFunction({ name: "adminDebug" })
    this.setData({
      opDone: true,
    });
  },

  home: function (event) {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  }
})