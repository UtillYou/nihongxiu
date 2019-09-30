var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

var app = getApp();

Page({
  data: {
    load:true,
    page:1,
    page_size:10,
    total: -1,
    collectList: []
  },
  getCollectList() {
    let that = this;
    util.request(api.CollectList,{p:that.data.page}).then(function (res) {
      console.log(res);
      if (res.code === 200) {
        console.log(res.data);
        that.setData({
          total: res.data.productList.length,
          collectList: res.data.productList
        });
      }
    });
  },
  onLoad: function (options) {
    this.getCollectList();
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭
  },
  openGoods(event) {
    
    let that = this;
    let goodsId = this.data.collectList[event.currentTarget.dataset.index].product_id;
    console.log(goodsId);
    wx.navigateTo({
      url: '/pages/goods/goods?id=' + goodsId,
    });
    return;
    //触摸时间距离页面打开的毫秒数  
    var touchTime = that.data.touch_end - that.data.touch_start;
    console.log(touchTime);
    //如果按下时间大于350为长按  
    if (touchTime > 350) {
      wx.showModal({
        title: '',
        content: '确定删除吗？',
        success: function (res) {
          if (res.confirm) {
            
            util.request(api.CollectAddOrDelete, { valueId: goodsId}, 'POST').then(function (res) {
              if (res.errno === 0) {
                console.log(res.data);
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 2000
                });
                that.getCollectList();
              }
            });
          }
        }
      })
    } else {
      
      wx.navigateTo({
        url: '/pages/goods/goods?id=' + goodsId,
      });
    }  
  },
  //按下事件开始  
  touchStart: function (e) {
    let that = this;
    that.setData({
      touch_start: e.timeStamp
    })
    console.log(e.timeStamp + '- touch-start')
  },
  //按下事件结束  
  touchEnd: function (e) {
    let that = this;
    that.setData({
      touch_end: e.timeStamp
    })
    console.log(e.timeStamp + '- touch-end')
  }, 
  deleteCollect: function (event)
  {
    let that = this;
    var product_id=   event.currentTarget.dataset.product_id;
    util.request(api.CollectAddOrDelete, {
      product_id: product_id,
    }).then(function (res) {
      console.log(res);
      if (res.code === 200) {
        that.getCollectList();
      }
    });

  },
  onPullDownRefresh(options) {
    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画。
    //重新获取数据
    this.getCollectList();
    wx.hideNavigationBarLoading(); //隐藏导航条加载动画。
    wx.stopPullDownRefresh(); //停止当前页面下拉刷新。
  },
  //上滑加载数据
  onReachBottom(options) { 
    let that = this;
    let page = this.data.page + 1;
    console.log(that.data.load);
    if (!that.data.load) {
      return;
    }
    util.request(api.CollectList, {
      p: page,
      page_size: this.data.page_size
    }).then(function (res) {
      console.log(res);
      if (res.code === 200) {
        if (res.data.productList.length == 0) {
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
          collectList: that.data.collectList.concat(res.data.productList),
          page: page
        });
      }
    });
  }

})