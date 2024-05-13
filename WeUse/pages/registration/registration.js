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

  onVerify: function () {
    // Validate the entered username and password (replace with your validation logic)
    const enteredStudentId = this.data.studentId;
    const enteredChiName = this.data.chiName;
    console.log(enteredStudentId)

    const matchedUser = studentData.find(user => user.studentId === enteredStudentId && user.name === enteredChiName);
    console.log(matchedUser)
    
    // Replace this with your actual user data validation
    if (matchedUser) {
        wx.setStorageSync('guestStatus', true)
        wx.showToast({
          title: 'Success',
          icon: 'success',
        });
        wx.reLaunch({
          url: '/pages/index/index',
        })
    }
      
    else if (studentData.find(user=>user.studentId===enteredStudentId&&user.name!=enteredChiName)){
        wx.showToast({
            title: 'Chinese Name Does Not Match Records',
            icon: 'none',
          });
    }

    else if(studentData.find(user=>user.studentId!=enteredStudentId&&user.name!=enteredChiName)){
        // Invalid credentials, display an error message
        wx.showToast({
          title: 'Invalid Student ID',
          icon: 'none',
        });
      }
  },

  home: function (event) {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
//Temporary
  SSOLogin: function (event) {
    wx.navigateToMiniProgram({
      appId: 'wx26508bde5a4f3f89',
    });
    wx.setStorageSync('guestStatus', true)
        wx.showToast({
          title: 'Success',
          icon: 'success',
        });
        wx.reLaunch({
          url: '/pages/index/index',
        })
  },
  //End Temporary

  help: function (event) {
    wx.showModal({
      title: 'Unable to Verify',
      content: 'Send your student ID and name to the WeUse WeChat Official Account. Once an administrator has verified you, you will recieve a notification through the WeUse WeChat Official Account.',
      showCancel: false,
      confirmText: 'Dismiss',
    })
  },
})