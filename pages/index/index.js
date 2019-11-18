//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 6000,
    duration: 500,
    swiperCurrent: 0,  
    selectCurrent:0,
    hasNoCoupons:true,
    couponsmore: true,
    circular:true,
    wxlogin: true
  },
  couponsBanner: function () {
    this.setData({
      hasNoCoupons: false
    })
  },
  getcoupons: function (e) {
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
            content: '礼券已经领完了',
            showCancel: false
          });
          that.setData({
            hasNoCoupons: true
          });
          return;
        }
        if (res.data.code == 20003) {
          wx.showModal({
            content: '您已经领过了',
            showCancel: false
          });
          that.setData({
            hasNoCoupons: true
          });
          return;
        }
        if (res.data.code == 0) {
          wx.showToast({
            title: '礼券领取成功',
            icon: 'success',
            duration: 2000
          });
          that.setData({
            hasNoCoupons: true
          });
        }
        
      }
    })
  },
  couponsClose: function () {
    var that = this;
    that.setData({
      hasNoCoupons: true
    })
  },
  swiperchange: function(e) {
       this.setData({  
        swiperCurrent: e.detail.current  
    })  
  },
  tapBanner: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/store/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  specialsBanner: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/store/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  tapSales: function (e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.id
    })
  },
  topicSales: function (e) {
    wx.navigateTo({
      url: "/pages/topic/index?id=" + e.currentTarget.dataset.id
    })
  },
  storesTap: function (e) {
    wx.navigateTo({
      url: "/pages/store/index?id=" + e.currentTarget.dataset.id
    })
  },
  onShow: function(){
    var that = this;
    setTimeout(function () {
      if (app.globalData.usinfo == 0) {
        that.setData({wxlogin: false})
        wx.hideTabBar();
      }
    }, 1000)

  },
  onLoad: function () {
    var that = this;
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })
    //首页顶部Logo
    wx.request({
      url: app.globalData.urls + '/banner/list',
      data: {
        type: 'toplogo'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            toplogo: res.data.data[0].picUrl,
            topname: res.data.data[0].title
          });
        }
      }
    })
    wx.request({
      url: app.globalData.urls + '/banner/list',
      data: {
        key: 'mallName',
        type: 'home'
      },
      success: function(res) {
        if (res.data.code == 0) {
          that.setData({
            banners: res.data.data
          });
        }
      }
    });
    wx.request({
      url: app.globalData.urls + '/banner/list',
      data: {
        type: 'sale'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            sales: res.data.data
          });
        }
      }
    });
    wx.request({
      url: app.globalData.urls + '/banner/list',
      data: {
        type: 'newcoupons'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            newcoupons: res.data.data[0],
            couponsmore: false
          });
        }
      }
    });
    wx.request({
      url: app.globalData.urls + '/banner/list',
      data: {
        type: 'special'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            specials: res.data.data
          });
        }
      }
    });
    wx.request({
      url: app.globalData.urls + '/shop/subshop/list',
      data: {
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            storeId: [],
            stores: res.data.data
          });
          var storeId = [];
          var std = {};
          for (var i = 0; i < res.data.data.length; i++) {
            //console.log(res.data.data[i].id);
            that.getstores(res.data.data[i].id, std)
          }
        }
      }
    });
  },
  getstores: function (e, std) {
    var that = this
    wx.request({
      url: app.globalData.urls + '/shop/goods/list',
      data: {
        shopId: e,
        recommendStatus: 1,
        pageSize: 10
      },
      success: function (res) {
        //console.log(res.data.data);
        that.setData({
          ccgoods: [],
          loadingMoreHidden: true
        });
        var cgoods = [];

        if (res.data.code != 0 || res.data.data.length == 0) {
          that.setData({
            loadingMoreHidden: false,
          });
          std[e] = cgoods;
          //console.log(std)
          that.setData({
            ccgoods: std,
          });
          return;
        }
        for (var i = 0; i < res.data.data.length; i++) {
          cgoods.push(res.data.data[i]);
        }
        std[e] = cgoods
        //console.log(std)
        that.setData({
          ccgoods: std,
        });
      }
    })
  },
  userlogin: function (e) {
    var that = this;
    var iv = e.detail.iv;
    var encryptedData = e.detail.encryptedData;
    wx.login({
      success: function (wxs) {
        wx.request({
          url: app.globalData.urls + '/user/wxapp/register/complex',
          data: {
            code: wxs.code,
            encryptedData: encryptedData,
            iv: iv
          },
          success: function (res) {
            if (res.data.code != 0) {
              wx.showModal({
                title: '温馨提示',
                content: '需要您的授权，才能正常使用哦～',
                showCancel: false,
                success: function (res) { }
              })
            } else {
              that.setData({ wxlogin: true })
              app.login();
              wx.showToast({
                title: '授权成功',
                duration: 2000
              })
              app.globalData.usinfo = 1;
              wx.showTabBar();
            }
          }
        })
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('mallName') + '—' + app.siteInfo.shareProfile,
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
})
