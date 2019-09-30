var util = require('../../utils/util.js');
var api = require('../../config/api.js');
const timer = require('../../utils/wxTimer.js')
var app = getApp()
Page({
  data: {
    goodsList: [],
    page: 1,
    total: -1,
    wxTimerList: {},
    load: true,
  },

  onLoad: function() {
    this.getGoodslist();
  },
  getGoodslist: function() {
    var that = this;
    //获取预售列表
    util.request(api.GetPresaleGoods, {
      p: 1,
    }).then(function(res) {
      console.log(res);
      if (res.code === 200) {
        if (res.data.goodsList.length>0) {
          that.create_timer(res.data.goodsList);
        }
        that.setData({
          goodsList: res.data.goodsList,
          total: res.data.goodsList.length,
        });
      }
    });
  },
  onReachBottom: function () {
    let that = this;
    let page = that.data.page + 1;
    if (!that.data.load) {
      return;
    }
    util.request(api.GetPresaleGoods, {
      p: page
    },'POST').then(function (res) {
      console.log(res);
      if (res.code === 200) {
        if (res.data.goodsList.length == 0) {
          //没有数据
          that.setData({
            load: false
          });
          wx.showToast({
            title: '没有更多数据了!',
            icon: 'none',
            duration: 2000,
          })
          return;
        }
        that.create_timer(res.data.goodsList);
        that.setData({
          page: page,
          goodsList: that.data.goodsList.concat(res.data.goodsList)
        });
      }
    });
  },
  create_timer: function (goodsList)
  {
    var that =this;
    var wxTimerList = that.data.wxTimerList;
    var timestamp = Date.parse(new Date()) / 1000;
    for (var i in goodsList) {
      var time = goodsList[i].presale_time - timestamp;
      if (time <= 0) {
        continue;
      }
      var each_timer = goodsList[i].product_id;
      if (wxTimerList[each_timer] !== undefined) {
        continue;
      }
      //循环商品开启定时
      var wxtimer = new timer({
        total_seconds: time,
        name: each_timer,
        complete: function (item_id) {
          //踢出商品
        }
      })
      wxtimer.start(that);
    }
  },
  onShow: function() {}
})