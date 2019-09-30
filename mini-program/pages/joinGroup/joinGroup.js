var app = getApp();
var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    picurl: '',
    infoWidth : 0,
  },

  onLoad: function(options) {
    let that =this;
    util.request(api.JoinGroup, {
        categoryid: that.data.id
      })
      .then(function(res) {
        console.log(res);
        if (res.code == 200) {
           that.setData({
             picurl:res.data.picurl
             });
        }
      });
  },
  onReady: function() {},
  onShow: function() {},
})