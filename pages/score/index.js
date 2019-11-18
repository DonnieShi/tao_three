var app = getApp();
Page({
  data:{
    score: 0,//积分
    score_sign_continuous: 0,//连续签到次数
    ci: 0 //今天是否已签到
  },

  onShow: function () {
    this.checkScoreSign();
    this.getScoreNumber();
  },

  onLoad: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/discounts/coupons',
      data: {
        type: 'score'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            scores: res.data.data
          });
        }
      }
    });
    if (that.data.ci == 0){
      wx.onAccelerometerChange(function (e) {
        if (e.x > 0.5 && e.y > 0.5) {
          wx.request({
            url: app.globalData.urls + '/score/sign',
            data: {
              token: app.globalData.token
            },
            success: function (res) {
              if (res.data.code == 0) {
                that.checkScoreSign();
                wx.showToast({
                  title: '签到成功',
                  icon: 'success',
                  duration: 2000
                });
                wx.vibrateLong();
                that.getScoreNumber();
              }
            }
          })
          
        }
      })
    }
    that.checkScoreSign();
    that.getScoreNumber();
    //获取签到规则
    wx.request({
      url: app.globalData.urls + '/score/sign/rules',
      data: {
      },
      success: function (res) {

        if (res.data.code == 0) {
          that.setData({
            rules: res.data.data
          });
        }
      }
    })
  },
  getScoreNumber: function() {
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
  checkScoreSign: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/score/today-signed',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            ci: 1
          });
        }
        wx.request({
          url: app.globalData.urls + '/score/sign/logs',
          data: {
            token: app.globalData.token,
          },
          success: function (res) {
            if (res.data.code == 0) {
              that.setData({
                score_sign_continuous: res.data.data.result[0].continuous
              });
            }
          }
        })
      }
    })
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
            title: '领取失败',
            content: '礼券已经领完了',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20003) {
          wx.showModal({
            title: '领取失败',
            content: '您已经领过了',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20004) {
          wx.showModal({
            title: '领取失败',
            content: '礼券已经过期',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 0) {
          wx.showToast({
            title: '礼券领取成功',
            icon: 'success',
            duration: 2000
          })
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  }

})