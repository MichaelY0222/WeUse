// pages/redeem/redeem.js
let QRData = '';
const userCredentials = require('../../userCredentials.js');
const itemList = require('../../itemList.js');
Page({

  /**
   * Page initial data
   */
  data: {
    showDebugInfo: false,
    guestStatus: false,
    itemId: 0,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    const itemId = options.itemId || 0;
    this.setData({
      showDebugInfo: wx.getStorageSync('showDebug'),
      guestStatus: wx.getStorageSync('guestStatus'),
      itemId: itemId,
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

  guestLogin: function (e) {
    wx.reLaunch({
      url: '/pages/registration/registration',
    });
  },
  home: function (e) {
    wx.reLaunch({
      url: '/pages/index/index',
    });
  },
})