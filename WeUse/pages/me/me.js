// pages/me/me.js
import CacheSingleton from '../../classes/CacheSingleton';
const { handleCode } = require('../../utils/handleCode');
let QRData = '';
const userCredentials = require('../../userCredentials.js');

Page({

  /**
   * Page initial data
   */
  data: {
    cacheSingleton: CacheSingleton,
    userOpenId: "-",
    studentId: "-",
    chiName: "-",
    clickCountTop: 0,
    resetTimerTop: null,
    showDebugInfo: false,
    needRegistration: false,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: async function (options) {
    this.data.cacheSingleton = CacheSingleton.getInstance();
    this.setData({
      userOpenId: await this.data.cacheSingleton.fetchUserOpenId(),
      needRegistration: await this.data.cacheSingleton.determineNeedNewUser(),
      showDebugInfo: wx.getStorageSync('showDebug'),
    })
    if (!this.data.needRegistration) {
      this.setData({
        studentId: await this.data.cacheSingleton.fetchUserInfo('studentId'),
        chiName: await this.data.cacheSingleton.fetchUserInfo('chiName'),
      })
    }
  },

  scan: function (event) {
    wx.scanCode({
        onlyFromCamera: true,
        success: (res) => {
          // Store the scanned data in the variable
          handleCode(res.result);
        },
        fail: (res) => {
          if (res.errMsg !== 'scanCode:fail cancel') {
            // Navigate to the specific page (replace with your page URL)
            console.error(res);
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
})