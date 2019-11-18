var wxpay = require('../../utils/pay.js')
var app = getApp()
Page({
  data:{
    statusType: ["待付款", "待发货", "待收货", "待评价", "已完成"],
    currentType:0,
    tabClass: ["", "", "", "", ""]
  },
  
  statusTap:function(e){
   
    var obj = e;
    var count = 0;
    for (var key in obj) {
      count++;
    }

    var curType = 0;
    if (count != 0) {
      if (e.currentType){
        curType = e.currentType
      }else{
        curType = e.currentTarget.dataset.index
      }
    }
     this.data.currentType = curType
     this.setData({
       currentType:curType
     });
     this.onShow();
  },
  orderDetail : function (e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/order-details/index?id=" + orderId
    })
  },
  cancelOrderTap:function(e){
    var that = this;
    var orderId = e.currentTarget.dataset.id;
     wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading();
          wx.request({
            url: app.globalData.urls + '/order/close',
            data: {
              token: app.globalData.token,
              orderId: orderId
            },
            success: (res) => {
              wx.hideLoading();
              if (res.data.code == 0) {
                that.onShow();
              }
            }
          })
        }
      }
    })
  },
  toPayTap:function(e){
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    var score = e.currentTarget.dataset.score;
    if (that.data.score >= score){
      wx.request({
        url: app.globalData.urls + '/user/amount',
        data: {
          token: app.globalData.token
        },
        success: function (res) {
          if (res.data.code == 0) {
            // res.data.data.balance
            money = money - res.data.data.balance;
            if (money <= 0) {
              // 直接使用余额支付
              wx.request({
                url: app.globalData.urls + '/order/pay',
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                  token: app.globalData.token,
                  orderId: orderId
                },
                success: function (res2) {
                  wx.reLaunch({
                    url: "/pages/my/index"
                  });
                }
              })
            } else {
              wxpay.wxpay(app, money, orderId, "/pages/my/index");
            }
          } else {
            wx.showModal({
              title: '错误',
              content: '无法获取用户资金信息',
              showCancel: false
            })
          }
        }
      })   
    }else{
      wx.showModal({
        title: '支付失败',
        content: '您的积分不足',
        showCancel: false
      })
    }
  },
  onLoad: function (e) {
    var that = this;
    that.getUserAmount();
    var currentType = e.currentType;
    that.data.currentType = currentType;
    that.setData({
      currentType: currentType
    });
    that.statusTap(e);
  },
  getUserAmount: function () {
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
    })
  },
  getOrderStatistics : function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/order/statistics',
      data: { token: app.globalData.token },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code == 0) {
          var tabClass = that.data.tabClass;
          if (res.data.data.count_id_no_pay > 0) {
            tabClass[0] = "red-dot"
          } else {
            tabClass[0] = ""
          }
          if (res.data.data.count_id_no_transfer > 0) {
            tabClass[1] = "red-dot"
          } else {
            tabClass[1] = ""
          }
          if (res.data.data.count_id_no_confirm > 0) {
            tabClass[2] = "red-dot"
          } else {
            tabClass[2] = ""
          }
          if (res.data.data.count_id_no_reputation > 0) {
            tabClass[3] = "red-dot"
          } else {
            tabClass[3] = ""
          }
          if (res.data.data.count_id_success > 0) {
            //tabClass[4] = "red-dot"
          } else {
            //tabClass[4] = ""
          }

          that.setData({
            tabClass: tabClass,
          });
        }
      }
    })
  },
  onShow:function(e){
    // 获取订单列表
    wx.showLoading();
    var that = this;
    var postData = {
      token: app.globalData.token
    };
    postData.status = that.data.currentType;
    this.getOrderStatistics();
    wx.request({
      url: app.globalData.urls + '/order/list',
      data: postData,
      success: (res) => {
        wx.hideLoading();
        if (res.data.code == 0) {
          that.setData({
            orderList: res.data.data.orderList,
            logisticsMap : res.data.data.logisticsMap,
            goodsMap : res.data.data.goodsMap
          });
          console.log(res.data.data.orderList)
        } else {
          this.setData({
            orderList: null,
            logisticsMap: {},
            goodsMap: {}
          });
        }
      }
    })
    
  },
  onHide:function(){
    // 生命周期函数--监听页面隐藏
 
  },
  onUnload:function(){
    // 生命周期函数--监听页面卸载
 
  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作
   
  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数
  
  }
})