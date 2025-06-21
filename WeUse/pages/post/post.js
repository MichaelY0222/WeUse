// pages/post/post.js
import CacheSingleton from '../../classes/CacheSingleton';
const { handleCode } = require('../../utils/handleCode');
let QRData = '';
const userCredentials = require('../../userCredentials.js');

Page({
  data: {
    cacheSingleton: CacheSingleton,
    itemList: [],
    showDebugInfo: false,
    needRegistration: false,
    userOpenId: 'undefined',
    grades: ['All','1','2','3','4','5','6','7','8','10','11','12'],
    subjects: ['All'],
    levels: ['All', 'S', 'S+', 'H', 'H+'],
    locations: ['ZXB中興樓', 'ZTB甄陶樓', 'LMB龍門樓'],
    selectedGrade: 0,
    selectedSubject: 0,
    selectedLevel: 0,
    selectedLocation: 0,
    images: [],
    itemName: '',
    itemPrice: ''
  },

  onLoad: async function(options) {
    this.data.cacheSingleton = CacheSingleton.getInstance();
    this.setData({
      userOpenId: await this.data.cacheSingleton.fetchUserOpenId(),
      needRegistration: await this.data.cacheSingleton.determineNeedNewUser(),
      showDebugInfo: wx.getStorageSync('showDebug'),
      itemList: await this.data.cacheSingleton.getItems(),
    });

    let tempList = [];
    for (let i = 0; i < this.data.itemList.length; i++) {
      if (!tempList.includes(this.data.itemList[i].subject)) {
        tempList.push(this.data.itemList[i].subject);
      }
    }
    this.setData({
      subjects: this.data.subjects.concat(tempList.sort())
    });
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

  guestLogin: function () {
    wx.reLaunch({ url: '/pages/registration/registration' });
  },

  bindGradeChange: function(e) {
    this.setData({ selectedGrade: e.detail.value });
  },

  bindSubjectChange: function(e) {
    this.setData({ selectedSubject: e.detail.value });
  },

  bindLevelChange: function(e) {
    this.setData({ selectedLevel: e.detail.value });
  },

  bindLocationChange: function(e) {
    this.setData({ selectedLocation: e.detail.value });
  },

  onItemNameInput: function(event) {
    this.setData({ itemName: event.detail.value });
  },

  onPriceInput: function(event) {
    this.setData({ itemPrice: event.detail.value });
  },

  uploadImage: function() {
    const that = this;
    wx.chooseMedia({
      count: 4 - that.data.images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        that.setData({
          images: that.data.images.concat(res.tempFiles.map(f => f.tempFilePath))
        });
      }
    });
  },

  removeImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const updated = [...this.data.images];
    updated.splice(index, 1);
    this.setData({ images: updated });
  },

  postItem: async function() {
    if (!this.data.itemName || this.data.images.length === 0) {
      wx.showToast({ title: '请填写名称并上传图片', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '上传中...' });

    try {
      const uploadedImgs = await Promise.all(
        this.data.images.map((imgPath, idx) => {
          return wx.cloud.uploadFile({
            cloudPath: `itemImages/${Date.now()}-${idx}.png`,
            filePath: imgPath
          });
        })
      );

      const db = wx.cloud.database();
      const form = this.data;

      await db.collection('Items').add({
        data: {
          index: 1,
          id: Math.floor(Math.random() * 10000),
          name: form.itemName,
          quantity: 1,
          grades: form.grades[form.selectedGrade],
          subject: form.subjects[form.selectedSubject],
          contributor: form.userOpenId,
          imgUrl: uploadedImgs.map(f => f.fileID),
          stamps: parseFloat(form.itemPrice) * 10,
          level: form.levels[form.selectedLevel],
          needsApproval: false,
          description: 'Say something about this item...'
        }
      });

      wx.hideLoading();
      wx.showToast({ title: '发布成功', icon: 'success' });

      this.setData({
        images: [],
        itemName: '',
        itemPrice: ''
      });

    } catch (err) {
      wx.hideLoading();
      console.error(err);
      wx.showToast({ title: '发布失败', icon: 'error' });
    }
  }
});