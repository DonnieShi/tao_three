var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {

  },

  storeTap: function (e) {
    wx.navigateTo({
      url: "/pages/store/index?id=" + e.currentTarget.dataset.id
    })
  },
  onLoad: function (e) {
    var that = this;
    var topictitle = that.data.topictitle;
    wx.request({
      url: app.globalData.urls + '/cms/news/detail',
      data: {
        id: e.id
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            topics: res.data.data
          });
          wx.setNavigationBarTitle({
            title: res.data.data.title
          })
          WxParse.wxParse('article', 'html', res.data.data.content, that, 5);
        }
      }
    })
  },
  onShareAppMessage: function (e) {
    return {
      title: this.data.goodsDetail.basicInfo.name,
      path: '/pages/topic/index' + e.id,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }


})