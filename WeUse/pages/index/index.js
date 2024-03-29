// pages/index/index.js
let QRData = '';
const userCredentials = require('../../userCredentials.js');
const itemList = require('../../itemList.js');
Page({

  /**
   * Page initial data
   */
  data: {
    clickCountTop: 0,
    resetTimerTop: null,
    itemList: [],
    showDebugInfo: false,
    guestStatus: false,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    this.setData({
      itemList,
      showDebugInfo: wx.getStorageSync('showDebug'),
      guestStatus: wx.getStorageSync('guestStatus')
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

  adminOverride: function () {
    const { clickCountTop, resetTimerTop } = this.data;

    // If there's an existing reset timer, clear it
    if (resetTimerTop) {
      clearTimeout(resetTimerTop);
    }

    // Increment the click count
    const newClickCount = clickCountTop + 1;
    this.setData({
      clickCountTop: newClickCount,
    });

    // Check if the click count reaches 5
    if (newClickCount === 5) {
      // Navigate to the new page
      wx.reLaunch({
        url: '/pages/adminOverride/adminOverride',
      });

      // Reset the click count to 0
      this.setData({
        clickCountTop: 0,
      });
    } else {
      // Set a timer to reset the click count after 2 seconds of inactivity
      const newResetTimer = setTimeout(() => {
        this.setData({
          clickCountTop: 0, // Reset the click count
        });
      }, 2000); // 2000 milliseconds = 2 seconds

      // Update the reset timer variable
      this.setData({
        resetTimerTop: newResetTimer,
      });
    }
  },

  guestLogin: function (e) {
    wx.reLaunch({
      url: '/pages/registration/registration',
    });
  },
})