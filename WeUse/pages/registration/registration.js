// pages/registration/registration.js
let QRData = '';
const userCredentials = require('../../userCredentials.js');
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
    gradeOptions: ['请选择...','12','11','10','9','8','7','6','5','4','3','2','1'],
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
        title: '加载中...',
      })
      wx.showModal({
        title: '确认注册',
        content: '您确认提交注册信息吗？信息提交后不可更改。',
        cancelText: '取消',
        confirmText: '确认',
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
        title: '错误',
        content: '您必须填写所有信息才能注册。请完善所有信息至指定的格式后重试。',
        showCancel: false,
        confirmText: '确认',
      })
    }
  },

  home: function (event) {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
})