var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp();
Page({
  data: {
    navList: [],
    goodsList: [],
    id: 0,
    currentCategory: {},
    page: 1,
    size: 20,
    come_from: 0,
    parent_name: '',
    load: true,
    currentTab: 0,
    navScrollLeft: 0,
    imgUrl : ''
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.setData({
      imgUrl: app.globalData.imgUrl,
    });
    if (options.id) {
      that.setData({
        id: options.id,
      });
    }
    if (options.come_from == 1) {
      that.setData({
        come_from: options.come_from,
        parent_name: options.parent_name
      });
    }
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          pixelRatio: res.pixelRatio,
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      },
    })
    this.getCategoryInfo();

  },
  getCategoryInfo: function() {
    let that = this;
    util.request(api.GoodsCategory, {
        categoryid: that.data.id
      })
      .then(function(res) {
        console.log(res);
        if (res.code == 200) {
          var id = that.data.id;
          //首页进入,如果不存在二级分类，给个提示并返回
          if (that.data.come_from == 1 && res.data.currentCategory !== null) {
            id = res.data.currentCategory._id;
          }
          var cur = 0;
          let navList = res.data.brotherCategory;
          //nav位置
          for (var i in navList) {
            if (navList[i]._id == id) {
              cur = i;
            }
          }
          var singleNavWidth = that.data.windowWidth / 5;
          that.setData({
            id: id,
            navList: navList,
            currentTab: cur,
            navScrollLeft: (cur - 2) * singleNavWidth
          });
          that.getGoodsList();

        } else {
          //显示错误信息
        }

      });
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
  getGoodsList: function() {
    var that = this;
    util.request(api.GoodsList, {
        categoryId: that.data.id,
        p: 1
      })
      .then(function(res) {
        console.log(res.data);
        if(res.code==200)
        {
          that.setData({
            goodsList: res.data.products,
            page: 1,
            load: true
          });
        }
        
      });
  },
  onUnload: function() {
    // 页面关闭
  },
  switchNav(event) {
    var cur = event.currentTarget.dataset.current;
    //每个tab选项宽度占1/5
    var singleNavWidth = this.data.windowWidth / 5;
    //tab选项居中                            
    this.setData({
      navScrollLeft: (cur - 2) * singleNavWidth
    })
    if (this.data.currentTab == cur) {
      return false;
    } else {
      this.setData({
        currentTab: cur,
        id: event.currentTarget.dataset.id,
      })
      this.getGoodsList();
    }
  },

  // switchCate: function(event) {
  //   if (this.data.id == event.currentTarget.dataset.id) {
  //     return false;
  //   }
  //   var that = this;
  //   var clientX = event.detail.x;
  //   var currentTarget = event.currentTarget;
  //   if (clientX < 60) {
  //     that.setData({
  //       scrollLeft: currentTarget.offsetLeft - 60
  //     });
  //   } else if (clientX > 330) {
  //     that.setData({
  //       scrollLeft: currentTarget.offsetLeft
  //     });
  //   }
  //   this.setData({
  //     id: event.currentTarget.dataset.id
  //   });

  //   this.getCategoryInfo();
  // },
  onPullDownRefresh(options) {
    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画。
    //重新获取数据
    // this.getCategoryInfo();
    wx.hideNavigationBarLoading(); //隐藏导航条加载动画。
    wx.stopPullDownRefresh(); //停止当前页面下拉刷新。
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
    }).then(function(res) {
      if (res.code === 200) {
        console.log(res.data);
        if (res.data.products.length == 0) {
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