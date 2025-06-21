// pages/redeem/redeem.js
import CacheSingleton from '../../classes/CacheSingleton';
const { handleCode } = require('../../utils/handleCode');
let QRData = '';
const userCredentials = require('../../userCredentials.js');
Page({

  /**
   * Page initial data
   */
  data: {
    showDebugInfo: false,
    needRegistration: false,
    userOpenId: 'undefined',
    itemIndex: "",
    itemList: [],
    currentImageDisplayIndex: 1,
  },

  onScroll: function(e) {
    const currentScrollPosition = e.detail.scrollLeft; // Get the current scroll position
    const currentScrollPositionRpx = (currentScrollPosition / wx.getDeviceInfo().screenWidth) * 750;
    this.setData({
      currentImageDisplayIndex: Math.floor((currentScrollPositionRpx+337.5)/675) + 1
    });
  },

  onBuyClick: function() {
    console.log('Buy Button clicked!');
    // Add your functionality here, e.g., navigate to another page
  },

  onLikeClick: function() {
    console.log('Like Button clicked!');
    // Add your functionality here, e.g., navigate to another page
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: async function(options) {
    //const itemId = options.itemId || 0;
    this.data.cacheSingleton = CacheSingleton.getInstance();
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('itemList', (resp) => {
      this.setData({
        itemList: resp,
      });
      eventChannel.on('itemId', (res) => { // PROMISE
        console.log(res);
        this.setData({
          itemIndex: res,
        });
        console.log(this.data.itemIndex);
        console.log(this.data.itemList[this.data.itemIndex].name)
      });
    });
    this.setData({
      userOpenId: await this.data.cacheSingleton.fetchUserOpenId(),
      needRegistration: await this.data.cacheSingleton.determineNeedNewUser(),
      showDebugInfo: wx.getStorageSync('showDebug'),
    })
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
  home: function (e) {
    wx.reLaunch({
      url: '/pages/index/index',
    });
  },
})

