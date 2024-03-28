// pages/me/me.js
Page({

  /**
   * Page initial data
   */
  data: {
    showDebugInfo: false,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    this.setData({
      showDebugInfo: wx.getStorageSync('showDebug')
    })
  },
})