var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp();

Page({
  data: {
    goodsList: [],
    page: 1,
    size: 8,
    load: true,
  },
  getGoodsList (){
    var that = this;

    util.request(api.GoodsTop, { is_hot: 1, p: 1, size: that.data.size},'POST')
      .then(function (res) {
        console.log(res);
        if (res.code === 200) {
          that.setData({
            goodsList: res.data.goodsList
          });
        }
      });
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.getGoodsList();
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
    util.request(api.GoodsHot, {
      p: page,
      size: this.data.size
    }).then(function (res) {
      console.log(res);
      if (res.code === 200) {
        if (res.data.goodsList.length == 0) {
          //没有数据
          that.setData({
            load: false
          });
          util.showErrorToast('没有更多数据了!');
          return;
        }
        that.setData({
          goodsList: that.data.goodsList.concat(res.data.goodsList),
          page: page
        });
      }else{
        that.setData({
          load: false
        });
        util.showErrorToast(res.message);
      }
    });
  },
  addToCart: function (e) {
      var that = this;
      var _id =  e.currentTarget.dataset.id;
      //添加到购物车
      util.request(api.CartAdd, {
        product_id: _id,
        qty: 1,
        custom_option: '',
      }, "POST")
        .then(function (res) {
          if (res.code == 200) {
            util.showSuccessToast('添加成功');
            app.globalData.cartTimer = 172800;
          } else {
            util.myalert(res.message);
          }

        });

    }



})