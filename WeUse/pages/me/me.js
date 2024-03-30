// pages/me/me.js
let QRData = ''; // THIS IS A COMMENT IN MAIN
const userCredentials = require('../../userCredentials.js');
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

  scan: function (event) {
    wx.scanCode({
        onlyFromCamera: true,
        success: (res) => {
            // Store the scanned data in the variable
            QRData = res.result;
            const matchedUser = userCredentials.find(user => user.username === QRData);
            if(matchedUser){
                wx.navigateTo({
                    url: `/pages/adminOverride/adminOverride?scanUsername=${QRData}`,
                });
            }
            else{
                wx.navigateTo({
                    url: '/pages/scanFail/scanFail',
                });
            }
          },
        fail: (res) => {
            if (res.errMsg !== 'scanCode:fail cancel') {
                // Navigate to the specific page (replace with your page URL)
                wx.navigateTo({
                  url: '/pages/scanFail/scanFail',
                });
              }
        },
    });
  },
})