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
    itemIndex: "",
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    //const itemId = options.itemId || 0;
    const eventChannel = this.getOpenerEventChannel();
    
    eventChannel.on('itemId', (res) => { // PROMISE
      console.log(res);
      this.setData({
        itemIndex: res,
      });
      console.log(this.data.itemIndex);
      console.log(itemList[this.data.itemIndex].name)
    });
    this.setData({
      showDebugInfo: wx.getStorageSync('showDebug'),
      guestStatus: wx.getStorageSync('guestStatus'),
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