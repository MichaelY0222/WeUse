// pages/scanFail/scanFail.js
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
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('errorDetail', (data) => {
      this.setData({
        caption: data,
      });
    })
  },

  back: function (event) {
    wx.navigateBack({
      url: '/pages/index/index',
    })
  },
})