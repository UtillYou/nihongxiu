var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    "increment_id": '',
    list: [],
    hasData: false,
  },
  getArticleInfo: function () {
    let _that = this;
    util.request(api.Logistics, {
      increment_id: _that.data.increment_id
    }).then(function (res) {
      console.log(res);
      if (res.code === 200) {
        _that.setData({
          list: res.data.logistics,
          hasData: true,
        })
      }
    });
  },

  onLoad: function (options) {
    console.log(options);
    // // 页面初始化 options为页面跳转所带来的参数
    if (options.increment_id) {
      this.setData({
        increment_id: options.increment_id
      });
    }
    this.getArticleInfo();
  },
  onReady: function () { },
  onShow: function () { },
  change: function (e) {
    
  }
})