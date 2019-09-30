var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    imgUrl : '',
  },
  onLoad: function () {
    this.setData({
      imgUrl: app.globalData.imgUrl,
    });
  },
  onReady: function () { },
  onShow: function () { },

})