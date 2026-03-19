// pages/post/post.js
import CacheSingleton from '../../classes/CacheSingleton';
const { handleCode } = require('../../utils/handleCode');

Page({
  data: {
    cacheSingleton: CacheSingleton,
    showDebugInfo: false,
    needRegistration: false,
    userOpenId: '',

    // Options
    gradesOptions: ['All Grades','1','2','3','4','5','6','7','8','9','10','11','12'],
    subjectOptions: ['All Subjects'],
    levelOptions: ['All Levels', 'S', 'S+', 'H', 'H+'],

    // Images
    images: [],

    // Form Data
    formData: {
      name: '',
      grades: '',
      subject: '',
      level: '',
      description: '',
      price: ''
    }
  },

  async onLoad() {
    const cache = CacheSingleton.getInstance();

    this.setData({
      cacheSingleton: cache,
      userOpenId: await cache.fetchUserOpenId(),
      needRegistration: await cache.determineNeedNewUser(),
      showDebugInfo: wx.getStorageSync('showDebug')
    });

    // Dynamically build subject list
    const items = await cache.getItems();
    let subjectSet = new Set();

    items.forEach(item => {
      if (item.subject) subjectSet.add(item.subject);
    });

    this.setData({
      subjectOptions: ['All Subjects', ...Array.from(subjectSet).sort()]
    });
  },

  // ======================
  // SCAN
  // ======================
  scan() {
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => handleCode(res.result),
      fail: (res) => {
        if (res.errMsg !== 'scanCode:fail cancel') {
          wx.navigateTo({ url: '/pages/scanFail/scanFail' });
        }
      }
    });
  },

  guestLogin() {
    wx.reLaunch({ url: '/pages/registration/registration' });
  },

  // ======================
  // IMAGE HANDLING
  // ======================
  chooseImage() {
    const remaining = 6 - this.data.images.length;

    wx.chooseMedia({
      count: remaining,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImgs = res.tempFiles.map(f => f.tempFilePath);
        this.setData({
          images: [...this.data.images, ...newImgs]
        });
      }
    });
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const updated = [...this.data.images];
    updated.splice(index, 1);
    this.setData({ images: updated });
  },

  // ======================
  // INPUT HANDLING
  // ======================
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;

    this.setData({
      [`formData.${field}`]: value
    });
  },

  onGradeChange(e) {
    const value = this.data.gradesOptions[e.detail.value];
    this.setData({
      'formData.grades': value
    });
  },

  onSubjectChange(e) {
    const value = this.data.subjectOptions[e.detail.value];
    this.setData({
      'formData.subject': value
    });
  },

  onLevelChange(e) {
    const value = this.data.levelOptions[e.detail.value];
    this.setData({
      'formData.level': value
    });
  },

  // ======================
  // SUBMIT
  // ======================
  async submitForm() {
    const { formData, images, userOpenId } = this.data;

    if (!formData.name) {
      wx.showModal({
        title: 'All Fields are Required',
        content: 'Please input item name before posting',
        showCancel: false,
        confirmText: "Dismiss"
      })
      return;
    }

    if (images.length === 0) {
      wx.showModal({
        title: 'All Fields are Required',
        content: 'Please upload at least one image before posting',
        showCancel: false,
        confirmText: "Dismiss"
      })
      return;
    }

    wx.showLoading({ title: 'Uploading...' });

    let checkItemConfig = await wx.cloud.database().collection("itemConfig").where({
      key: "idIndex",
    }).get();

    try {
      // 1️⃣ Upload Images
      const uploaded = await Promise.all(
        images.map((imgPath, index) => {
          return wx.cloud.uploadFile({
            cloudPath: `itemImages/${formData.name}-${Date.now()/1000}-${index}.png`,
            filePath: imgPath
          });
        })
      );

      const fileIDs = uploaded.map(res => res.fileID);

      // 2️⃣ Save to Database
      const db = wx.cloud.database();

      await db.collection('items').add({
        data: {
          id: checkItemConfig.data[0].id,
          index: checkItemConfig.data[0].index,
          name: formData.name,
          description: formData.description || '',
          grades: formData.grades || 'All Grades',
          subject: formData.subject || 'All Subjects',
          level: formData.level || 'All Levels',
          contributor: userOpenId,
          imgUrl: fileIDs,
          quantity: 1,
          stamps: parseFloat(formData.price || 0) * 10,
          needsApproval: false
        }
      });

      wx.hideLoading();
      wx.showToast({ title: 'Success', icon: 'success' });

      // Reset form
      this.setData({
        images: [],
        formData: {
          name: '',
          grades: '',
          subject: '',
          level: '',
          description: '',
          price: ''
        }
      });

    } catch (err) {
      wx.hideLoading();
      console.error(err);
      wx.showToast({ title: 'Failed', icon: 'none' });
    }
  }
});