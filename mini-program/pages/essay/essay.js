var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    "url_key": 'usage_rule',
    itemList: [],
    returnCode : 200,
  },
  getArticleInfo: function () {
    let _that = this;
    util.request(api.Essay, {
      url_key: _that.data.url_key
    }).then(function (res) {
      console.log(res);
      if (res.code === 200) {
        let _content = res.data.content;
        res.data.content = _content.replace(/\<img/gi, '<img style="width:100%;height:auto" ');
        _that.setData({
          itemList: res.data,
        })
      }else{
        _that.setData({
          returnCode: res.code,
        })
        //util.showErrorToast(res.message);
      }
    });
  },

  onLoad: function (options) {
    // console.log(options);
    // // 页面初始化 options为页面跳转所带来的参数
    if (options.url_key) {
      this.setData({
        url_key: options.url_key
      });
    }
    this.getArticleInfo();
  },
  onReady: function () { },
  onShow: function () { },
  change: function (e) {
    // this.setData({
    //   isOpen: this.data.isOpen ? false : true
    // })
  }
})