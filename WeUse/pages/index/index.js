// pages/index/index.js
import CacheSingleton from '../../classes/CacheSingleton';
const { handleCode } = require('../../utils/handleCode');
let QRData = '';
const userCredentials = require('../../userCredentials.js');
const { join } = require('../../userCredentials.js');

Page({
  /**
   * Page initial data
   */
  data: {
    filteredItemList: [],
    cacheSingleton: CacheSingleton,
    showDebugInfo: false,
    gradeFilters: ['All','1','2','3','4','5','6','7','8','10','11','12'],
    gradeFilterIndex: 0,
    subjectFilters: ['All'],
    subjectFilterIndex: 0,
    levelFilters: ['All', 'S', 'S+', 'H', 'H+'],
    levelFilterIndex: 0,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: async function(options) {
    wx.showLoading({
      title: 'Loading...',
    })
    wx.cloud.init();
    this.data.cacheSingleton = await CacheSingleton.initialize(wx.cloud.database());
    this.setData({
      itemList: await this.data.cacheSingleton.getItems(),
      filteredItemList: await this.data.cacheSingleton.getItems(),
      showDebugInfo: await wx.getStorageSync('showDebug'),
    })
    console.log(this.data.itemList)
    let tempList = [];
    for (let i = 0; i < this.data.itemList.length; i++) {
      if (!tempList.includes(this.data.itemList[i].subject)) {
        tempList.push(this.data.itemList[i].subject);
      }
    }
    this.setData({
      subjectFilters: this.data.subjectFilters.concat(tempList.sort())
    })
    this.refreshList();
    wx.hideLoading();
  },

  refreshList: function () {
    this.setData({
      itemListsLengthDifferent: this.data.filteredItemList.length%2 == 1,
      noResults: !this.data.filteredItemList.length>0
    })
  },

  bindSearchList: function (event) {
    this.setData({
      substringFilter: event.detail.value
    })
    this.filterList();
  },

  bindGradeFilter: function (event) {
    this.setData({
      gradeFilterIndex: event.detail.value
    })
    this.filterList();
  },

  bindSubjectFilter: function (event) {
    this.setData({
      subjectFilterIndex: event.detail.value
    })
    this.filterList();
  },

  bindLevelFilter: function (event) {
    this.setData({
      levelFilterIndex: event.detail.value
    })
    this.filterList();
  },

  fillInHyphen: function (grades) {
    if (grades !== undefined && grades.includes('-')) {
      let start = parseInt(grades.substring(0, grades.indexOf('-')));
      let end = parseInt(grades.substring(grades.indexOf('-')+1, grades.length));
      let output = ''
      for (let i = start; i <= end; i++) {
        if (i < 10){
          output += "0";
        }
        output += i.toString() + "_";
      }  
      return output;
    }
    else {
      if (grades.length < 2)
      {
        return "0" + grades;
      }
      return grades;
    }
  },

  underscorify: function (levels) {
    if (levels.includes(', ')) {
      levels = levels.split(', ');
      levels = levels.join('_, ');
    }
    return levels + "_";
  },

  filterList: function () {
    itemListFiltered = this.data.itemList;
    
    if (this.data.substringFilter != undefined) {
      itemListFiltered = itemListFiltered.filter(item => item.name.toLowerCase().includes(this.data.substringFilter.toLowerCase()));
    }

    let selectedGrade = this.data.gradeFilters[this.data.gradeFilterIndex];
    if (selectedGrade !== undefined) {
      if (selectedGrade.length<2) {
        selectedGrade = "0" + selectedGrade;
      }
      if (selectedGrade !== "All") {
        itemListFiltered = itemListFiltered.filter(item => this.fillInHyphen(item.grades).includes(selectedGrade) || item.grades === 'All');
      }
    }

    let selectedSubject = this.data.subjectFilters[this.data.subjectFilterIndex];
    if (selectedSubject !== undefined) {
      if (selectedSubject !== "All") {
        itemListFiltered = itemListFiltered.filter(item => (item.subject+'_').includes(selectedSubject+'_') || item.subject === 'All');
      }
    }

    let selectedLevel = this.data.levelFilters[this.data.levelFilterIndex];
    if (selectedLevel !== undefined) {
      if (selectedLevel !== "All") {
        itemListFiltered = itemListFiltered.filter(item => this.underscorify(item.level).includes(selectedLevel+'_') || item.level === 'All');
      }
    }
    this.setData({
      filteredItemList: itemListFiltered
    })
    this.refreshList();
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

  clearFilters: function (e) {
    this.setData({
      gradeFilterIndex: 0,
      subjectFilterIndex: 0,
      levelFilterIndex: 0
    })
    this.filterList();
  },

  redeem: function (x) {
    console.log(x.currentTarget.dataset.id);
    wx.navigateTo({
      url: '/pages/redeem/redeem',
      success: (res) => {
        res.eventChannel.emit("itemList", this.data.itemList);
        res.eventChannel.emit("itemId", x.currentTarget.dataset.id);
      }
    });
  }
})