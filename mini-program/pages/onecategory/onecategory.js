var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp();
Page({
  data: {
    goodsList: [],
    page: 1,
    size: 20,
    load: true,
    cname:'商品列表',
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;

    if (options.id) {
      that.setData({
        id: options.id,
      });
    }
    if (options.cname){
      that.setData({
        cname: options.cname,
      });
    }
    wx.setNavigationBarTitle({
      title: that.data.cname//页面标题为路由参数
    })

    that.getGoodsList();
   
  },

  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  getGoodsList: function () {
    var that = this;
    util.request(api.GoodsList, {
      categoryId: that.data.id,
      p: 1
    }).then(function (res) {
        console.log(res.data);
        if (res.code == 200) {
          that.setData({
            goodsList: res.data.products,
            page: 1,
            load: true
          });
          if (res.data.count == that.data.page){
            that.setData({
              load: false
            });
          }
        }

      });
  },
  onUnload: function () {
    // 页面关闭
  },
  
  //上滑加载数据
  onReachBottom(options) {
    let that = this;
    let page = this.data.page + 1;
    if (!that.data.load) {
      return;
    }
    util.request(api.GoodsList, {
      categoryId: that.data.id,
      p: page
    }).then(function (res) {
      if (res.code === 200) {
        console.log(res.data);
        if (page == res.data.count) {
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
        that.setData({
          goodsList: that.data.goodsList.concat(res.data.products),
          page: page
        });
      }
    });
  }

})