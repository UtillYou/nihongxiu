var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

var app = getApp();

Page({
  data: {
    couponList: [],
    addressId: 0,
  },
  onLoad: function(options) {
    var that = this;
    if (options.addressId) {
      that.setData({
        addressId: options.addressId
      });
    }
    wx.getStorage({
      key: 'couponlist',
      success(res) {
        that.setData({
          couponList: res.data
        });
      }
    })
  },
  selectCoupon: function(event) {
    var that =this;
    var coupon_code = event.currentTarget.dataset.couponCode;
    var ischecked = event.currentTarget.dataset.ischecked;
    
    var apiUrl = api.AddCoupon;
    if (ischecked)
    {
      apiUrl = api.CancelCoupon;
    }
    console.log('--->');
    //调用添加优惠券接口,成功跳转
    util.request(apiUrl, {
      coupon_code: coupon_code
    },'POST').then(function (res) {
      console.log(res.code);
      console.log(res);
      if (res.code === 200) {
        console.log(that.data.addressId);
        console.log('这里来了');
        wx.redirectTo({
          url: '/pages/shopping/checkout/checkout?addressId=' + that.data.addressId
        })
      }
    });
  },
  onReady: function() {

  },
  onShow: function() {

  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭
  }
})