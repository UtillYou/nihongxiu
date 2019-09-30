var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp()
Page({
  data: {
    id:'',
    topImage:'',
    scrollHeight:'',
    goodsList:[],
  },

  onLoad: function(options) {
    var that = this;
    if (options.id)
    {
      that.setData({
        id:options.id
      });
    }
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });
  },
  onShow:function(){
    var that = this;
    //获取数据
    util.request(api.TopicDetail,{id:that.data.id}).then(function (res) {
      console.log(res);
      if (res.code === 200) {
        wx.setNavigationBarTitle({
          title: res.data.title
        })
        that.setData({
          goodsList: res.data.products,
          topImage: res.data.img2,
        });
      }
    });
  },

})