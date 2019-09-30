var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    navList: [],
    categoryList: [],
    currentCategory: {},
    scrollLeft: 0,
    scrollTop: 0,
    goodsCount: 0,
    scrollHeight: 0
  },
  onLoad: function(options) {
    this.getCatalog();
  },
  onPullDownRefresh: function () {
    this.onLoad();
    wx.stopPullDownRefresh();
  },
  getCatalog: function() {
    //CatalogList
    let that = this;
    util.request(api.CatalogList).then(function(res) {
      console.log('------');
      console.log(res);
      console.log('------');
      //处理接口数据，获取一级分类和当前分类
      let oneCatgory = [];
      let currentChildCategory = [];
      let j = 0;
      for (var i in res) {
        if (j == 0) {
          currentChildCategory = res[i]; //默认打开第一个分类
          currentChildCategory['subCategoryList'] = res[i]['child'];
        }
        oneCatgory.push(res[i]);
        j++;
      }
     
      that.setData({
        navList: oneCatgory,
        currentCategory: currentChildCategory
      });
      // wx.setStorage({
      //   key: 'local_category',
      //   data: res
      // });
    });

    // util.request(api.GoodsCount).then(function (res) {
    //   that.setData({
    //     goodsCount: res.data.goodsCount
    //   });
    // });

  },
  getCurrentCategory: function(id) {
    let that = this;
    let chocieCategory = [];
    //获取点击分类的信息
    let navList = that.data.navList;
    for (var i in navList) {
      if (navList[i]._id == id) {
        chocieCategory = navList[i];
        chocieCategory['subCategoryList'] = navList[i].child;
      }
    }
    that.setData({
      currentCategory: chocieCategory
    });
    // util.request(api.CatalogCurrent, {
    //     id: id
    //   })
    //   .then(function(res) {
    //     that.setData({
    //       currentCategory: res.data.currentCategory
    //     });
    //   });
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  getList: function() {
    var that = this;
    util.request(api.ApiRootUrl + 'api/catalog/' + that.data.currentCategory.cat_id)
      .then(function(res) {
        that.setData({
          categoryList: res.data,
        });
      });
  },
  switchCate: function(event) {
    var that = this;
    var currentTarget = event.currentTarget;
    if (this.data.currentCategory._id == event.currentTarget.dataset.id) {
      return false;
    }
    this.getCurrentCategory(event.currentTarget.dataset.id);
  }
})