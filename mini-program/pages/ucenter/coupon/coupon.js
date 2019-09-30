var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');



var app = getApp();

Page({
  data: {
    couponList:[],
    total : -1,
  },
  getCouponList() {
    let that = this;
    util.request(api.CouponList, {}).then(function (res) {
      console.log(res);
      if (res.code === 200) {
        that.setData({
          total: res.data.coupon_list.length,
          couponList: res.data.coupon_list
        });
      }
    });
  },
  onLoad: function (options) {
    this.getCouponList();
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭
  },
  gohome:function()
  {
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})