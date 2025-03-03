let instance = null;

class CacheSingleton {
    #db
    #imageUrls
    #userOpenId
    #needRegistration
    #studentId
    #studentChiName
    #isAdmin
    constructor(db) {
        this.#db = db;
    }
    static initialize(db) {
        wx.showLoading({
          title: '加载中...',
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
        });
        if (instance === null) {
          wx.hideLoading();
          throw new Error("CacheSingleton not initialized");
        }
        wx.hideLoading();
        return instance;
    }

    async getTeacherImages(totalImages, rerenderCallback) {
        wx.showLoading({
          title: '加载中...',
        });
        if (this.#imageUrls !== undefined) {
            wx.hideLoading();
            rerenderCallback();
            return;
        }
        this.#imageUrls = Array(totalImages);
        for (let i=1;i<=totalImages;i++) {
            wx.cloud.downloadFile({
                fileID: `cloud://asb-center-7gixak2a33f2f3e5.6173-asb-center-7gixak2a33f2f3e5-1307575779/BabyPictures/${i}.jpg`
            }).then((res) => {
                this.#imageUrls[i-1] = res.tempFilePath;
                wx.hideLoading();
                rerenderCallback();
            })
        }
    }

    fetchImageUrls() {
        return this.#imageUrls;
    }

    async fetchUserOpenId() {
      wx.showLoading({
        title: '加载中...',
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