var util = require('../../utils/util.js');
var api = require('../../config/api.js');

var app = getApp()
Page({
  data: {
    keyword: '',
    searchStatus: true,
    goodsList: [],
    helpKeyword: [],
    historyKeyword: [],
    categoryFilter: false,
    currentSortType: 'default', //默认筛选字段
    reviewCountOrder: '1', //默认评论排序
    priceOrder: '2', //默认价格排序
    filterCategory: [
      // {
      //   'id': 1,
      //   'name': '衣服'
      // }
    ],
    defaultKeyword: '',
    hotKeyword: [],
    page: 1,
    page_size: 20,
    categoryId: 0, //默认分类
    searchNum:-1,
    imgUrl : '',
    load:true,
  },
  //事件处理函数
  closeSearch: function() {
    wx.navigateBack()
  },
  clearKeyword: function() {
    this.setData({
      keyword: '',
      searchStatus: false,
      imgUrl: app.globalData.imgUrl,
    });
    wx.removeStorageSync('historyKeyword');
  },
  onLoad: function() {
    this.getSearchKeyword();
  },

  getSearchKeyword() {
    let that = this;
    //缓存中获取搜索历史记录
    util.request(api.SearchIndex).then(function(res) {
      console.log(res);
      if (res.code == 200) {
        let historyKeyword = wx.getStorageSync('historyKeyword');
        if (historyKeyword == '') {
          historyKeyword = [];
        }
        that.setData({
          historyKeyword: historyKeyword,
          defaultKeyword: res.data.defaultKeyword,
          hotKeyword: res.data.hotKeyword
        });
      }
    });
  },

  inputChange: function(e) {
    console.log('选择了inout' + e.detail.value)
    this.setData({
      keyword: e.detail.value,
      searchStatus: false
    });
    // this.getHelpKeyword();
  },
  getHelpKeyword: function() {
    let that = this;
    util.request(api.SearchHelper, {
      keyword: that.data.keyword
    }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          helpKeyword: res.data
        });
      }
    });
  },
  inputFocus: function() {
    this.setData({
      searchStatus: false,
      goodsList: []
    });

  },
  clearHistory: function() {
    this.setData({
      historyKeyword: []
    })

    //缓存中清除
    wx.removeStorage({
      key: 'historyKeyword',
      success(res) {
        console.log(res.data)
      }
    })

  },
  getGoodsList: function() {
    let that = this;
    this.setData({
      load: true,
      page:1,
    })
    var page = that.data.page;
    util.request(api.GoodsSearchList, {
      q: that.data.keyword,
      p: page,
      // page_size: that.data.page_size,
      // review_count: that.data.reviewCountOrder,
      // price: that.data.priceOrder,
      // categoryId: that.data.categoryId
    }).then(function(res) {
      console.log(res);
      if (res.code === 200) {
        that.setData({
          searchStatus: true,
          categoryFilter: false,
          goodsList: res.data.products,
          searchNum: res.data.products.length,
          page: page+1,
        });
        if (res.data.page  >= res.data.count) {
          //没有数据
          that.setData({
            load: false
          });
          return;
        }

      }

      //重新获取关键词
      // that.getSearchKeyword();
    });
  },
  onKeywordTap: function(event) {
    console.log('开始搜' + event.target.dataset.keyword);
    this.getSearchResult(event.target.dataset.keyword);

  },
  getSearchResult(keyword) {
    this.setData({
      keyword: keyword,
      p: 1,
      page_size: this.data.page_size,
      categoryId: 0,
      goodsList: []
    });

    this.getGoodsList();
  },
  openSortFilter: function(event) {
    let currentId = event.currentTarget.id;
    switch (currentId) {
      // case 'categoryFilter':
      //   this.setData({
      //     'categoryFilter': !this.data.categoryFilter,
      //     'currentSortOrder': 'asc'
      //   });
      //   break;
      case 'reviewSort':
        let reviewCountOrder = 2;
        if (this.data.reviewCountOrder == 2) {
          reviewCountOrder = 1;
        }
        this.setData({
          'currentSortType': 'review',
          'reviewCountOrder': reviewCountOrder,
          'categoryFilter': false
        });
        break;
      case 'priceSort':
        let tmpSortOrder = 1;
        if (this.data.priceOrder == 1) {
          tmpSortOrder = 2;
        }
        console.log(tmpSortOrder);
        this.setData({
          'currentSortType': 'price',
          'priceOrder': tmpSortOrder,
          'categoryFilter': false
        });

        this.getGoodsList();
        break;
      default:
        //综合排序
        this.setData({
          'currentSortType': 'default',
          // 'currentSortOrder': 'desc',
          'categoryFilter': false
        });
        this.getGoodsList();
    }
  },
  selectCategory: function(event) {
    let currentIndex = event.target.dataset.categoryIndex;
    let filterCategory = this.data.filterCategory;
    let currentCategory = null;
    for (let key in filterCategory) {
      if (key == currentIndex) {
        filterCategory[key].selected = true;
        currentCategory = filterCategory[key];
      } else {
        filterCategory[key].selected = false;
      }
    }
    this.setData({
      'filterCategory': filterCategory,
      'categoryFilter': false,
      categoryId: currentCategory.id,
      page: 1,
      goodsList: []
    });
    this.getGoodsList();
  },
  onKeywordConfirm(event) {
    let keywords = wx.getStorageSync('historyKeyword');
    if (keywords == '') {
      keywords = [];
    }
    if (keywords.indexOf(event.detail.value) == -1) {
      keywords.push(event.detail.value);
    }
    if (keywords.length > 10) {
      keywords.shift();
    }
    wx.setStorage({
      key: 'historyKeyword',
      data: keywords
    })
    this.getSearchResult(event.detail.value);
  },
  
  //上滑加载数据
  onReachBottom(options) {
    let that = this;
    let page = this.data.page + 1;
    if (!that.data.load) {
      return;
    }
    util.request(api.GoodsSearchList, {
      q: that.data.keyword,
      p: that.data.page,
      // page_size: that.data.page_size,
      // review_count: that.data.reviewCountOrder,
      // price: that.data.priceOrder,
      // categoryId: that.data.categoryId
    }).then(function (res) {
      if (res.code === 200) {
        that.setData({
          searchStatus: true,
          categoryFilter: false,
          goodsList: that.data.goodsList.concat(res.data.products),
          searchNum: res.data.products.length,
          page: page,
        });
        if (res.data.page  >= res.data.count) {
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
      }
    });
  }

})