// pages/registration/registration.js
const { handleCode } = require('../../utils/handleCode');
let QRData = '';
const studentData = require('../../studentData.js');
let usernameset = '';
Page({

  /**
   * Page initial data
   */
  data: {
    studentId: '', // Store the entered username
    chiName: '', // Store the entered password
    scanUsername: '',
    grade: 0,
    gradeOptions: ['Please Select...','12','11','10','9','8','7','6','5','4','3','2','1'],
    showDebugInfo: false,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    this.setData({
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

  scanId: function (event) {
    wx.scanCode({
        onlyFromCamera: true,
        success: (res) => {
            // Store the scanned data in the variable
            usernameset = res.result;
            console.log("Scanned Data:", usernameset);
            this.setData({
                studentId: usernameset,
              });
          },
        fail: (res) => {
        },
    });
  },

  onStudentIdInput: function (e) {
    this.setData({
      studentId: e.detail.value,
    });
  },

  onChiNameInput: function (e) {
    this.setData({
      chiName: e.detail.value,
    });
  },

  gradeChanged: function(x) {
    this.setData({
        grade: x.detail.value,
    });
  },

  onVerify: function () {
    const regex = /^G(201[3-9]|202[0-4])010\d{3}$/;
    if (this.data.chiName.length !== 0 && this.data.grade !== "0" && regex.test(this.data.studentId)) {
      wx.showLoading({
        title: 'Loading...',
        mask: true
      })
      wx.showModal({
        title: 'Confirm Registration',
        content: 'Your registration is permanent and cannot be changed.',
        cancelText: 'Cancel',
        confirmText: 'Confirm',
        complete: async (res) => {
          if (res.confirm) {
            await wx.cloud.callFunction({
              name: "registerUser",
              data: {
                chiName: this.data.chiName,
                grade: this.data.gradeOptions[this.data.grade],
                studentId: this.data.studentId
              }
            })
            wx.hideLoading();
            this.home();
          }
          wx.hideLoading();
        }
      })
    } else {
      wx.showModal({
        title: 'Error',
        content: 'You must complete all fields to the correct format to submit your registration.',
        showCancel: false,
        confirmText: 'Dismiss',
      })
    }
  },

  home: function (event) {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
})