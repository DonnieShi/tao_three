var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    nums: {},
    stid: 0,
    shopNum: 0,
    currentTab: 0, 
    activeCategoryId: 0,
    shopType: "addShopCar",
    hideShopPopup: true,
    noticePopup:true,
    fooderPopup: false,
    minusStatus: 'disabled',
    goodsDetail: {},
    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax:{},
    totalPrice:0, 
    shopCarInfos: {},
    shopCarInfo:{},
    list:[],
    cgoods:0, 
    cdis:0,
    goodsid:[]
  },
  onShow:function(){
    
    var that=this
    wx.getStorage({
      key: 'shopCarInfos',
      success: function (res) {
        
        var shopid = that.data.stid;
        var shopCarInfos = res.data;
        var shopCarInfo = {};
        var nums = {};
        var shopNum = 0;
        var totalPrice = 0;
        var shopList = [];
        if (shopCarInfos[shopid]) {
          shopCarInfo = shopCarInfos[shopid]
          for (var i = 0; i < shopCarInfo.shopList.length; i++) {
            nums[shopCarInfo.shopList[i].goodsId] = shopCarInfo.shopList[i].number
            shopNum += shopCarInfo.shopList[i].number
          }
          if (shopCarInfos[shopid] && shopCarInfos[shopid].shopList) {
            shopList = shopCarInfos[shopid].shopList;
            for (var i = 0; i < shopList.length; i++) {
              totalPrice += shopList[i].number * shopList[i].price
            }
          }
        }
        that.setData({
          shopCarInfos: shopCarInfos,
          shopNum: shopNum,
          shopCarInfo: shopCarInfo,
          nums: nums,
          list: shopList,
          totalPrice: totalPrice
        });
      },fail:function(){
        
        that.setData({
          shopCarInfos: {},
          shopNum: 0,
          shopCarInfo: {},
          nums: {},
          list: [],
          totalPrice: 0
        });
      }
    });

  },
  onLoad: function (e) {
    var that = this;
    
    that.setData({
      stid: e.id,
    });
    wx.getStorage({
      key: 'shopCarInfos',
      success: function (res) {
        var shopid = that.data.stid;
        var shopCarInfos = res.data;
        var shopCarInfo = {};
        var nums={};
        var shopNum=0;
        var totalPrice = 0;
        var shopList = [];
        if (shopCarInfos[shopid]) {
          shopCarInfo = shopCarInfos[shopid]
          for (var i = 0; i < shopCarInfo.shopList.length; i++) {
            nums[shopCarInfo.shopList[i].goodsId] = shopCarInfo.shopList[i].number
            shopNum += shopCarInfo.shopList[i].number
          }
          if (shopCarInfos[shopid] && shopCarInfos[shopid].shopList) {
            shopList = shopCarInfos[shopid].shopList;
            for (var i = 0; i < shopList.length; i++) {
              totalPrice += shopList[i].number * shopList[i].price
            }
          }
        }
        that.setData({
          shopCarInfos: shopCarInfos,
          shopNum:shopNum,
          shopCarInfo: shopCarInfo,
          nums: nums,
          list: shopList,
          totalPrice: totalPrice
        });
      }
    });
    wx.request({
      url: app.globalData.urls + '/shop/subshop/detail',
      data: {
        id: e.id
      },
      success: function (res) {
        if (res.data.code == 0) {
          var stid = that.data.stid;
          that.setData({
            stid: e.id,
            stores: res.data.data
          });
          var styp = res.data.data.type;
          wx.request({
            url: app.globalData.urls + '/notice/list',
            data: {
              key: 'mallName',
              type: styp
            },
            success: function (res) {
              var notices =[];
              if (res.data.code == 0) {
                for (var i = 0; i < res.data.data.dataList.length; i++) {
                  if (res.data.data.dataList[i].type == styp){
                    notices.push(res.data.data.dataList[i]);
                  }
                }
                that.setData({
                  notices: notices
                });
              }
            }
          });
          wx.request({
            url: app.globalData.urls + '/shop/goods/category/all',
            success: function (res) {
              var categories = [{ id: 0, name: "推荐" }];
              if (res.data.code == 0) {
                
                for (var i = 0; i < res.data.data.length; i++) {
                  
                  if (res.data.data[i].type == styp) {
                    categories.push(res.data.data[i]);
                  }
                }
              }
              
              that.setData({
                categories: categories,
                activeCategoryId: 0
              });
              that.getGoodsList(0);
              
            }
          })
          wx.setNavigationBarTitle({
            title: res.data.data.name
          })
        }
      }
    });
  
    wx.request({
      url: app.globalData.urls + '/shop/goods/list',
      data:{
        shopId:e.id 
      },
      success: function (res) {
        var goodsid=[]
        if (res.data.code==0){
          var cgoodss = res.data.data
          if (cgoodss.length > 0) {
            for (var i = 0; i < cgoodss.length; i++) {
              var cdi = cgoodss[i];
              goodsid.push(cdi['id']);
            }
          }
        }
        that.setData({
          goodsid: goodsid,
        });
        that.reputations();
      }
    });
  },
  reputations:function(){
    var that = this;
    var goodsid = that.data.goodsid
    var reputation=[];
    var cdis = 0;
    for (var i = 0; i < goodsid.length; i++) {
      wx.request({
        url: app.globalData.urls + '/shop/goods/reputation',
        data: {
          goodsId: goodsid[i] 
        },
        success: function (res) {
          if (res.data.code == 0) {
            var ress = res.data.data
            if (ress.length>0){
              for (var j = 0; j < ress.length; j++){
                reputation.push(ress[j]);
              }
              cdis += res.data.data.length;
            }
          }
          that.setData({
            reputation: reputation,
            cdis: cdis
          });
          
        }
      });
    }
  },
  getGoodsList: function (categoryId) {
    if (categoryId == 0) {
      categoryId = "";
    }
    var that = this;
    wx.request({
      url: app.globalData.urls + '/shop/goods/list',
      data: {
        shopId: that.data.stid,
        categoryId: categoryId
      },
      success: function (res) {
        that.setData({
          goods: [],
          loadingMoreHidden: true
        });
        var goods = [];
        var goodsDetail = {};
        var buyNumMax={};
        if (res.data.code != 0 || res.data.data.length == 0) {
          that.setData({
            loadingMoreHidden: false,
          });
          return;
        }
        
        for (var i = 0; i < res.data.data.length; i++) {
         
          if (categoryId == ''){
            if (res.data.data[i].recommendStatus == 1 ){
             
              goods.push(res.data.data[i]);
            }
           
          }else{
            goods.push(res.data.data[i]);
          }
          goodsDetail[res.data.data[i].id] = res.data.data[i]
          buyNumMax[res.data.data[i].id] = res.data.data[i].stores
        }
        
        var cgoods = res.data.data.length;
        that.setData({
          goods: goods,
          goodsDetail: goodsDetail,
          buyNumMax: buyNumMax,
          cgoods:cgoods,
        });
      }
    })
  },
  tabClick: function (e) {
    this.setData({
      activeCategoryId: e.currentTarget.id
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  calling: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.id
    })
  },
  toAddShopCar: function () {
    this.setData({
      shopType: "addShopCar"
    })
    this.bindGuiGeTap();
  },
  bindGuiGeTap: function () {
    this.setData({
      hideShopPopup: false
    })
  },
  noticesTap: function(e) {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/notice/detail',
      data: {
        id: e.currentTarget.dataset.id
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            notice: res.data.data,
            noticePopup: false
          });
          WxParse.wxParse('article', 'html', res.data.data.content, that, 5);
        }
      }
    })
  },
  noticPopupTap: function () {
    this.setData({
      noticePopup: true
    })
  },
  closePopupTap: function () {
   
    this.setData({
      hideShopPopup: true
    })
  },
  onShareAppMessage: function () {
    return {
      title: this.data.goodsDetail.basicInfo.name,
      path: '/pages/store/index' + that.data.stid,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
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
  bindMinus: function (e) {
    var nums = this.data.nums;
    var id = e.currentTarget.dataset.current;
    if (nums[id] >= 1) {
      nums[id]--;

    }
    var minusStatus = nums[id] < 1 ? 'disabled' : 'normal';
    var totalPrice = 0;
    var goodsDetail = this.data.goodsDetail;
    var shopNum = 0;
    for (var i in nums) {
      shopNum += nums[i];
      if (goodsDetail[i]){
        if (goodsDetail[i].minPrice > 0) {
          totalPrice += (nums[i] * goodsDetail[i].minPrice)
        } else {
          totalPrice += (nums[i] * goodsDetail[i].originalPrice)
        }
      }
    }
    this.setData({
      nums: nums,
      minusStatus: minusStatus,
      shopNum: shopNum,
      totalPrice: totalPrice
    });
    var shopid = this.data.stid;
    var shopCarInfo = this.bulidShopCarInfo();
    var shopCarInfos = this.data.shopCarInfos;
    shopCarInfos[shopid] = shopCarInfo;
    var shopList = [];
    if (shopCarInfos[shopid] && shopCarInfos[shopid].shopList) {
      shopList = shopCarInfos[shopid].shopList;
    }
    wx.setStorage({
      key: "shopCarInfos",
      data: shopCarInfos
    })
    this.setData({
      list: shopList,
      shopCarInfos: shopCarInfos
    })
  },
  bindPlus: function (e) {
    var id = e.currentTarget.dataset.current;
    
    var nums = this.data.nums;
    if (!nums[id]) {
      nums[id] = 0;
    }
    nums[id]++;
    if (this.data.buyNumMax[id] < nums[id]) {
      wx.showToast({
        title: '没有库存啦',
        image: '../../images/hj_alert.png',
        duration: 2000
      })
      nums[id]--;
      return;
    }
    var minusStatus = nums[id] < 1 ? 'disabled' : 'normal';
    var totalPrice = 0;
    var goodsDetail = this.data.goodsDetail;
    
    var shopNum = 0
    for (var i in nums) {
      
      shopNum += nums[i];
      if (goodsDetail[i]){
        if (goodsDetail[i].minPrice > 0) {
          totalPrice += (nums[i] * goodsDetail[i].minPrice)
        } else {
          totalPrice += (nums[i] * goodsDetail[i].originalPrice)
        }
      }
    }
    this.setData({
      nums: nums,
      minusStatus: minusStatus,
      shopNum: shopNum,
      totalPrice: totalPrice
    });
    var shopid = this.data.stid;
    var shopCarInfo = this.bulidShopCarInfo();
    var shopCarInfos = this.data.shopCarInfos;
    shopCarInfos[shopid] = shopCarInfo;
    var shopList = [];
    if (shopCarInfos[shopid] && shopCarInfos[shopid].shopList) {
      shopList = shopCarInfos[shopid].shopList;
    }
    wx.setStorage({
      key: "shopCarInfos",
      data: shopCarInfos
    })
    this.setData({
      list: shopList,
      shopCarInfos: shopCarInfos
    })
  },
  /*  //
  bindManual: function (e) {
    var id = e.currentTarget.dataset.current;
    var num = parseInt(e.detail.value);
    var nums = this.data.nums;

    if (this.data.buyNumMax[id] < num) {
      wx.showModal({
        title: '提示',
        content: '购买数量超出库存！',
        showCancel: false
      })
      this.setData({
        nums: nums,
      });
      return;
    }
    nums[id] = 0;
    nums[id] += num;
    var shopNum = 0
    var totalPrice = 0;
    var goodsDetail = this.data.goodsDetail;

    for (var i in nums) {
      shopNum += nums[i];
      if (goodsDetail[i].minPrice > 0) {
        totalPrice += (nums[i] * goodsDetail[i].minPrice)
      } else {
        totalPrice += (nums[i] * goodsDetail[i].originalPrice)
      }
    }
    this.setData({
      nums: nums,
      shopNum: shopNum,
      totalPrice: totalPrice
    });
    var shopCarInfo = this.bulidShopCarInfo(id);
    this.setData({
      shopCarInfo: shopCarInfo,
    });
    wx.setStorage({
      key: "shopCarInfo",
      data: shopCarInfo
    })
  },*/
  goShopCar: function (e) {

    var id = e.currentTarget.dataset.current
    this.setData({
      hideShopPopup: false,
     
    })
  },
  bulidShopCarInfo: function () {
    var shopCarInfo = {};
    var nums = this.data.nums;
    var nums = this.data.nums;
    var shopNum = this.data.shopNum;
    shopCarInfo.nums = nums
    shopCarInfo.shopNum = shopNum
    shopCarInfo.shopList = []
    
    for (var e in nums) {
      if (nums[e]>0){
        var shopCarMap = {};
        if (this.data.goodsDetail[e]){
          shopCarMap.goodsId = this.data.goodsDetail[e].id;
          shopCarMap.pic = this.data.goodsDetail[e].pic;
          shopCarMap.name = this.data.goodsDetail[e].name;
          shopCarMap.propertyChildIds = this.data.propertyChildIds;
          shopCarMap.label = this.data.propertyChildNames;
          shopCarMap.left = "";
          shopCarMap.active = true;
          shopCarMap.number = this.data.nums[e];
          shopCarMap.logisticsType = this.data.goodsDetail[e].logisticsId;
          //shopCarMap.logistics = this.data.goodsDetail[e].logistics;
          if (this.data.goodsDetail[e].minPrice > 0) {
            shopCarMap.price = this.data.goodsDetail[e].minPrice
          } else {
            shopCarMap.price = this.data.goodsDetail[e].originalPrice
          }
          shopCarMap.weight = this.data.goodsDetail[e].weight;
          
          shopCarInfo.shopList.push(shopCarMap);
        }
      }
    }
    return shopCarInfo;
  },
  ClearShopCar:function(e){
    var id = e.currentTarget.dataset.current;
    var shopCarInfos = this.data.shopCarInfos;
    delete shopCarInfos[id];
    this.setData({
      list: [],
      shopCarInfos: shopCarInfos,
      nums:{},
      shopNum:0,
      totalPrice:0
    })
    wx.setStorage({
      key: "shopCarInfos",
      data: shopCarInfos
    });
  },
  /**
	  * 立即购买
	  */
  buyNow: function () {
    //只有从购物车去付款
    if (this.data.shopNum < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    var id = this.data.stid
    wx.navigateTo({
      url: "/pages/to-pay-order/index?shopid="+id
    })
  },
  onPageScroll: function (t) {
    if (t.scrollTop >= 300) {
      this.setData({
        navigationbar: "scrollTop"
      })
    } else {
      this.setData({
        navigationbar: "",
      })
    }
  }
    
})