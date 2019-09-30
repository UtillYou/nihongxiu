var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    id: 1,
    itemList: [],
  },
  getArticleInfo: function() {
    let _that = this;
    util.request(api.TopicDetail, {
      id: _that.data.id
    }).then(function(res) {
      console.log(res);
      if (res.code === 200) {
        _that.setData({
          itemList: res.data
        })
      }
    });
  },

  onLoad: function(options) {
    // // 页面初始化 options为页面跳转所带来的参数
    if (options.id) {
      this.setData({
        id: options.id
      });
    }
    this.getArticleInfo();
  },
  onReady: function() {},
  onShow: function() {},
  change: function(e) {
    this.setData({
      isOpen: this.data.isOpen ? false : true
    })
  }
})