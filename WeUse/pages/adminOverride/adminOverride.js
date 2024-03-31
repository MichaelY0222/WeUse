const userCredentials = require('../../userCredentials.js');
let usernameset = '';
Page({
  /**
   * Page initial data
   */
  data: {
    username: '', // Store the entered username
    password: '', // Store the entered password
    scanUsername: '',
    showDebugInfo: false,
    loginStatus: false,
    guestStatus: false
  },
  onLoad: function (options) {
      const scanUsername = options.scanUsername || '';
        this.setData({
          showDebugInfo: wx.getStorageSync('showDebug'),
          loginStatus: wx.getStorageSync('isLoggedIn'),
          guestStatus: wx.getStorageSync('guestStatus'),
          username: scanUsername,
        });
  },

  onUsernameInput: function (e) {
    // Update the 'username' data variable as the user types
    this.setData({
      username: e.detail.value,
    });
  },

  onPasswordInput: function (e) {
    // Update the 'password' data variable as the user types
    this.setData({
      password: e.detail.value,
    });
  },

  guestLogout: function (e) {
    // Update the 'username' data variable as the user types
    wx.setStorageSync('guestStatus', false)
    this.setData({
      guestStatus: false,
    });
  },

  pwdreset: function (e) {
        wx.showModal({
          title: 'Forgot Password',
          content: 'Send your new password to the WeUse WeChat Official Account.\n Note: The password of the admin account associated with this WeChat account will be changed. Contact system administrator to reset the password of non-WeChat based accounts.',
          showCancel: false,
          confirmText: 'Dismiss',
        })
  },

  onLogin: function () {
    // Validate the entered username and password (replace with your validation logic)
    const enteredUsername = this.data.username;
    const enteredPassword = this.data.password;

    const matchedUser = userCredentials.find(user => user.username === enteredUsername && user.password === enteredPassword);
    
    // Replace this with your actual user data validation
    if (matchedUser) {
        wx.setStorageSync('isLoggedIn', true)
        this.setData({
          loginStatus: true,
        })
    }
      
    else if (userCredentials.find(user=>user.username===enteredUsername&&user.password!=enteredPassword)){
        wx.showToast({
            title: 'Invalid Password',
            icon: 'none',
          });
    }

    else if(userCredentials.find(user=>user.username!=enteredUsername&&user.password!=enteredPassword)){
        // Invalid credentials, display an error message
        wx.showToast({
          title: 'Invalid Username',
          icon: 'none',
        });
      }
  },

  scan: function (event) {
    wx.scanCode({
        onlyFromCamera: true,
        success: (res) => {
            // Store the scanned data in the variable
            usernameset = res.result;
            console.log("Scanned Data:", usernameset);
            this.setData({
                username: usernameset,
              });
          },
        fail: (res) => {
        },
    });
  },

  onDebugSwitch: function (e) {
    if (this.data.showDebugInfo){
      wx.setStorageSync('showDebug', false)
      this.setData({
        showDebugInfo: false
      })
    }
    else{
      wx.setStorageSync('showDebug', true)
      this.setData({
        showDebugInfo: true
      })
    }
  },

  home: function (event) {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },

  logout: function (event) {
    wx.setStorageSync('isLoggedIn', false)
    this.setData({
      loginStatus: false,
    })
  },

  onViewLogs: function (event) {
    wx.navigateTo({
      url: '/pages/logs/logs',
    })
  },
})