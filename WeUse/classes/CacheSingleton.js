import allCollectionsData from "../utils/allCollectionsData";
import { item } from "./item";
let instance = null;

class CacheSingleton {
    #db
    #userOpenId
    #needRegistration
    #studentId
    #studentChiName
    #isAdmin
    #items
    constructor(db) {
        this.#db = db;
    }
    static initialize(db) {
        wx.showLoading({
          title: '加载中...',
          mask: true
        }); 
        if (instance === null) {
          instance = new CacheSingleton(db);
        }
        wx.hideLoading();
        return instance;
    }
    static getInstance() {
        wx.showLoading({
          title: '加载中...',
          mask: true
        });
        if (instance === null) {
          wx.hideLoading();
          throw new Error("CacheSingleton not initialized");
        }
        wx.hideLoading();
        return instance;
    }
    async getItems() {
      if (this.#items !== undefined) {
        console.log("Items Already Fetched");
        wx.hideLoading();
        return this.#items;
      }
      this.#items = new Array();
      let items = await allCollectionsData(this.#db, "items");
      for (let i=0;i<items.data.length;i++) {
          this.#items.push(new item(items.data[i].index, items.data[i].id, items.data[i].name, items.data[i].quantity, items.data[i].grades, items.data[i].subject, items.data[i].contributor, items.data[i].imgUrl, items.data[i].stamps, items.data[i].level, items.data[i].needsApproval, items.data[i].description));
      }
      return this.#items;
    }
    async fetchUserOpenId() {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
      if (this.#userOpenId !== undefined) {
        wx.hideLoading();
        return this.#userOpenId;
      }
      let res = ((await wx.cloud.callFunction({
        name: "fetchUserOpenId",
      })).result).openid;
      this.#userOpenId = res;
      wx.hideLoading();
      return this.#userOpenId;
    }

    async determineNeedNewUser() {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
      if (this.#needRegistration !== undefined) {
        console.log("Registration Status Already Fetched");
        wx.hideLoading();
        return this.#needRegistration;
      }
      let checkUser = await wx.cloud.database().collection("userData").where({
        userId: this.#userOpenId,
      }).get();
      if (checkUser.data.length === 0){
        console.log("User not registered...")
        wx.hideLoading();
        this.#needRegistration = true;
        return this.#needRegistration;
      }
      this.#studentChiName = checkUser.data[0].chiName;
      this.#studentId = checkUser.data[0].studentId;
      this.#needRegistration = false;
      let checkAdmin = await wx.cloud.database().collection("admins").where({
        adminId: checkUser.data[0]._id,
      }).get();
      if (checkAdmin.data.length === 1){
        this.#isAdmin = true;
      } else this.#isAdmin = false;
      wx.hideLoading();
      return this.#needRegistration;
    }

    fetchUserInfo(option) {
      if (option === 'studentId') {
        return this.#studentId;
      } else if (option === 'chiName') {
        return this.#studentChiName;
      } else if (option === 'isAdmin') {
        return this.#isAdmin;
      } else return undefined;
    }
}

export default CacheSingleton;