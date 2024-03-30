// pages/index/index.js
let QRData = '';
const userCredentials = require('../../userCredentials.js');
const itemList = require('../../itemList.js');
let itemListFiltered = itemList;

Page({
  /**
   * Page initial data
   */
  data: {
    clickCountTop: 0,
    resetTimerTop: null,
    itemList: [],
    showDebugInfo: false,
    guestStatus: false,
    gradeFilters: ['All','7','8','10','11','12'],
    gradeFilterIndex: 0,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    this.setData({
      itemList,
      showDebugInfo: wx.getStorageSync('showDebug'),
      guestStatus: wx.getStorageSync('guestStatus'),
    })
    this.setData({
      itemListOdd: itemList.filter((item, index) => index % 2 === 0),
      itemListEven: itemList.filter((item, index) => index % 2 === 1),
    })
    this.setData({
      itemListsLengthDifferent: this.data.itemListOdd.length !== this.data.itemListEven.length
    })
  },

  refreshList: function () {
    this.setData({
      itemListOdd: itemListFiltered.filter((item, index) => index % 2 === 0),
      itemListEven: itemListFiltered.filter((item, index) => index % 2 === 1),
    })
    this.setData({
      itemListsLengthDifferent: this.data.itemListOdd.length !== this.data.itemListEven.length
    })
  },

  searchList: function(e) {
    this.setData({
      substringFilter: e.detail.value
    })
    this.filterList();
  },

  bindGradeFilter: function(e) {
    this.setData({
      gradeFilterIndex: e.detail.value
    })
    this.filterList();
  },

  fillInHyphen: function (grades) {
    if (grades !== undefined && grades.includes('-')) {
      let start = parseInt(grades.substring(0, grades.indexOf('-')));
      let end = parseInt(grades.substring(grades.indexOf('-')+1, grades.length));
      let output = ''
      for (let i = start; i < end; i++) {
        output += i.toString();
      }  
      return output;
    }
    else {
      return grades;
    }
  },

  filterList: function() {
    itemListFiltered = itemList;

    if (itemListFiltered.lastIndexOf > 0) {
      itemListFiltered = itemList.filter(item => item.name.toLowerCase().includes(this.data.substringFilter.toLowerCase()));
    }
    let selectedGrade = this.data.gradeFilters[this.data.gradeFilterIndex];
    if (selectedGrade !== "All") {
      itemListFiltered = itemListFiltered.filter(item => this.fillInHyphen(item.grades).includes(selectedGrade));
    }
    this.refreshList();
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

  guestLogin: function (e) {
    wx.reLaunch({
      url: '/pages/registration/registration',
    });
  },
})