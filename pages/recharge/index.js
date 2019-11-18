var wxpay = require('../../utils/pay.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    MoneyGroup: 0,
    balance: 0,
    amount: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this
    wx.request({
      url: app.globalData.urls + '/banner/list',
      data: {
        key: 'mallName',
        type: 'recharge'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            recharges: res.data.data
          });
        }
      }
    });
    wx.request({
      url: app.globalData.urls + '/score/send/rule',
      data: {
        code: 'RECHARGE'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            scores: res.data.data
          });
        }
      }
    });
  },
  onShow: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/user/amount',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            balance: res.data.data.balance,
            freeze: res.data.data.freeze,
            score: res.data.data.score
          });
        }
      }
    })
  },
  radioChange: function (e) {
    var amount = this.data.amount;
    this.setData({
      amount: e.detail.value
    });
  },
  btnChange: function () {
    var amount = this.data.amount
    if (amount == 0) {
      wx.showModal({
        title: '提示',
        content: '请先选择充值金额',
        showCancel: false
      })
      return
    }else{
      wxpay.wxpay(app, amount, 0, "/pages/my/index");
    }
  }
})