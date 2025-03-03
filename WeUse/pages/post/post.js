// pages/post/post.js
import CacheSingleton from '../../classes/CacheSingleton';
let QRData = '';
const userCredentials = require('../../userCredentials.js');
const itemList = require('../../itemList.js');
Page({

  /**
   * Page initial data
   */
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
    selectedLocation: 0
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: async function(options) {
    this.data.cacheSingleton = CacheSingleton.getInstance();
    this.setData({
      userOpenId: await this.data.cacheSingleton.fetchUserOpenId(),
      needRegistration: await this.data.cacheSingleton.determineNeedNewUser(),
      showDebugInfo: wx.getStorageSync('showDebug'),
      itemList,
    })

    let tempList = [];
    for (let i = 0; i < itemList.length; i++) {
      if (!tempList.includes(itemList[i].subject)) {
        tempList.push(itemList[i].subject);
      }
    }
    this.setData({
      subjects: this.data.subjects.concat(tempList.sort())
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

  guestLogin: function (e) {
    wx.reLaunch({
      url: '/pages/registration/registration',
    });
  },

  bindGradeChange: function(e) {
    this.setData({
      selectedGrade: e.detail.value
    });
    console.log("Selected Grade", this.data.grades[this.data.selectedGrade]);
  },

  bindSubjectChange: function(e) {
    this.setData({
      selectedSubject: e.detail.value
    });
    console.log("Selected Subject", this.data.subjects[this.data.selectedSubject]);
  },

  bindLevelChange: function(e) {
    this.setData({
      selectedLevel: e.detail.value
    });
    console.log("Selected Level", this.data.levels[this.data.selectedLevel]);
  },

  bindLocationChange: function(e) {
    this.setData({
      selectedLocation: e.detail.value
    });
    console.log("Selected Location", this.data.locations[this.data.selectedLocation]);
  },

  uploadImage: function() {
    console.log("UPLOAD")
    // Function to handle image upload
  },

  postItem: function() {
    console.log("POST")
    // Function to handle posting the item
  },

  // Empty functions for input detection
  onItemNameInput: function(event) {
    var objectName = event.detail.value;
    console.log("Name is " + objectName);
  },

  onPriceInput: function(event) {
    var objectPrice = event.detail.value;
    console.log("Price is ¥" + objectPrice);
  },
})