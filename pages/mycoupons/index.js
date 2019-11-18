//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    pwd: '',
    busid: 0,
  },
  onLoad: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/config/get-value',
      data: {
        key: 'coupons'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            busid: res.data.data.value
          });
        }
      }
    })
  },
  onShow : function () {
    this.getMyCoupons();
  },
  listenerCouponsInput: function (e) {
    this.data.pwd = e.detail.value;
    this.data.busid = e.currentTarget.dataset.id;
  },
  listenerDuiHuan: function () {
    //console.log('id', this.data.busid);
    wx.request({
      url: app.globalData.urls + '/discounts/fetch',
      data: {
        id: this.data.busid,
        pwd: this.data.pwd,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '兑换成功',
            icon: 'success',
            duration: 2000
          })
        }
        if (res.data.code == 20001 || res.data.code == 20002) {
          wx.showModal({
            title: '兑换失败',
            content: '已经兑换完了',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20003) {
          wx.showModal({
            title: '兑换失败',
            content: '兑换已达上限',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20000) {
          wx.showModal({
            title: '兑换失败',
            content: '兑换码不存在',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 600) {
          wx.showModal({
            title: '兑换失败',
            content: '请输入兑换码',
            showCancel: false
          })
          return;
        }
      }
    })
  },
  getMyCoupons: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/discounts/my',
      data: {
        token: app.globalData.token,
        status: 0
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            coupons: res.data.data,
            loadingMoreHidden: true
          });
        }else{
          that.setData({
            loadingMoreHidden: false
          });
        }
      }
    })
  },
  home: function () {
    wx.navigateTo({
      url: "/pages/coupons/index"
    })
  }

})
