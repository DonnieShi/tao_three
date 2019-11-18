var app = getApp()
Page({
  data: {
    score: 0,
    currentTab: 0,
    storePopup: true,
    cmsid: 0
  },

  onShow:function () {
    var that = this
    that.getUserScore();
  },
  onLoad: function () {
    var that = this
    that.getUserScore();
    wx.request({
      url: app.globalData.urls + '/discounts/coupons',
      data: {
        type: 'store'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            scores: res.data.data
          });
        }
      }
    });
    wx.request({
      url: app.globalData.urls + '/shop/goods/category/all',
      data: {
        type: 'store'
      },
      success: function (res) {
        if (res.data.code == 0) {
          for (var i = 0; i < res.data.data.length; i++) {
            if (res.data.data[i].type == 'score'){
              that.getScoreType(res.data.data[i].id)
            }
          }
        }
      }
    });
  },
  getScoreType: function(e){
    var that = this;
    wx.request({
      url: app.globalData.urls + '/shop/goods/list',
      data: {
        categoryId: e
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            contents: res.data.data
          });
        }
      }
    });
  },
  getUserScore: function(){
    var that = this;
    wx.request({
      url: app.globalData.urls + '/user/amount',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            score: res.data.data.score
          });
        }
      }
    });
  },
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  gitCoupon: function (e) {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/discounts/fetch',
      data: {
        id: e.currentTarget.dataset.id,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 20001 || res.data.code == 20002) {
          wx.showModal({
            title: '兑换失败',
            content: '礼券已经兑完了',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20003) {
          wx.showModal({
            title: '兑换失败',
            content: '您已经兑换过了',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20004) {
          wx.showModal({
            title: '兑换失败',
            content: '礼券已经过期',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 0) {
          wx.showToast({
            title: '礼券兑换成功',
            icon: 'success',
            duration: 2000
          })
          that.getUserScore();
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },
  storePopupTap: function () {
    this.setData({
      storePopup: true
    })
  },
  storeGeTap: function(e){
    var that = this;
    var buyNowInfo = that.buliduBuyNowInfo(e);
    wx.setStorage({
      key: "buyNowInfo",
      data: buyNowInfo
    })
    wx.navigateTo({
      url: "/pages/to-score-order/index?orderType=buyNow"
    }) 
  },
  buliduBuyNowInfo: function (e) {
    var that = this;
    console.log(e)
    var shopCarMap = {};
    shopCarMap.goodsId = e.currentTarget.dataset.id;
    shopCarMap.pic = e.currentTarget.dataset.pic;
    shopCarMap.name = e.currentTarget.dataset.name;
    shopCarMap.propertyChildIds = '';
    shopCarMap.label = '';
    shopCarMap.price = e.currentTarget.dataset.price;
    shopCarMap.score = e.currentTarget.dataset.score;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = 1;
    shopCarMap.logisticsType = 0;
    shopCarMap.logistics = {};
    shopCarMap.weight = 0;

    var buyNowInfo = {};
    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = 0;
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }
    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
  }, 
  getorderList: function(){
    wx.navigateTo({
      url: "/pages/order-list/index?currentType=1"
    }) 
  }
})
