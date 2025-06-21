// pages/me/me.js
import CacheSingleton from '../../classes/CacheSingleton';
const { handleCode } = require('../../utils/handleCode');
let QRData = '';
const userCredentials = require('../../userCredentials.js');

Page({
  data: {
    cacheSingleton: CacheSingleton,
    userOpenId: '-',
    studentId: '-',
    chiName: '-',
    clickCountTop: 0,
    resetTimerTop: null,
    showDebugInfo: false,
    needRegistration: false,

    avatarUrl: '',
    wechatId: '',
    phoneNumber: '',
    gNumber: '',
    postCounts: 0,
    sellCounts: 0,
    getCounts: 0,

    favorites: []
  },

  onLoad: async function (options) {
    this.data.cacheSingleton = CacheSingleton.getInstance();

    const userOpenId = await this.data.cacheSingleton.fetchUserOpenId();
    const needRegistration = await this.data.cacheSingleton.determineNeedNewUser();
    const showDebugInfo = wx.getStorageSync('showDebug');

    this.setData({ userOpenId, needRegistration, showDebugInfo });

    if (!needRegistration) {
      const studentId = await this.data.cacheSingleton.fetchUserInfo('studentId');
      const chiName = await this.data.cacheSingleton.fetchUserInfo('chiName');
      const avatarUrl = await this.data.cacheSingleton.fetchUserInfo('avatarUrl');
      const wechatId = await this.data.cacheSingleton.fetchUserInfo('wechatId');
      const phoneNumber = await this.data.cacheSingleton.fetchUserInfo('phoneNumber');
      const gNumber = await this.data.cacheSingleton.fetchUserInfo('gNumber');
      const postCounts = await this.data.cacheSingleton.fetchPostCount();
      const sellCounts = await this.data.cacheSingleton.fetchSellCount();
      const getCounts = await this.data.cacheSingleton.fetchGetCount();
      const favorites = await this.data.cacheSingleton.fetchFavorites();

      this.setData({
        studentId,
        chiName,
        avatarUrl,
        wechatId,
        phoneNumber,
        gNumber,
        postCounts,
        sellCounts,
        getCounts,
        favorites
      });
    }
  },

  scan: function (event) {
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        handleCode(res.result);
      },
      fail: (res) => {
        if (res.errMsg !== 'scanCode:fail cancel') {
          console.error(res);
          wx.navigateTo({ url: '/pages/scanFail/scanFail' });
        }
      },
    });
  },

  guestLogin: function (e) {
    wx.reLaunch({ url: '/pages/registration/registration' });
  },

  adminOverride: function () {
    const { clickCountTop, resetTimerTop } = this.data;
    if (resetTimerTop) clearTimeout(resetTimerTop);

    const newClickCount = clickCountTop + 1;
    this.setData({ clickCountTop: newClickCount });

    if (newClickCount === 5) {
      wx.reLaunch({ url: '/pages/adminOverride/adminOverride' });
      this.setData({ clickCountTop: 0 });
    } else {
      const newResetTimer = setTimeout(() => {
        this.setData({ clickCountTop: 0 });
      }, 2000);
      this.setData({ resetTimerTop: newResetTimer });
    }
  },

  contactSeller: function (e) {
    const sellerId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/chat/chat?target=${sellerId}` });
  },

  removeFavorite: function (e) {
    const index = e.currentTarget.dataset.index;
    const newFavorites = [...this.data.favorites];
    newFavorites.splice(index, 1);
    this.setData({ favorites: newFavorites });
    // Optional: update DB here
  },

  viewItem: function (e) {
    const itemId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/itemDetail/itemDetail?id=${itemId}` });
  }
});