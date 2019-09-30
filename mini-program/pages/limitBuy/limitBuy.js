var util = require('../../utils/util.js');
var api = require('../../config/api.js');
const timer = require('../../utils/wxTimer.js')
var app = getApp()
Page({
  data: {
    limitGoods: [],
    backImage: '',
    switchtab: [],
    currentTab: 0,
    tabScroll: 0,
    windowHeight: '',
    windowWidth: '',
    countDownList: {},
    actEndTimeList: {},
    trumpArr: [],
    load: true,
    page: 1,
    id: 0,
    spiking: false, //默认未开始
    imgUrl:'',
    isEnd:0
  },

  onLoad: function() {
    wx.getSystemInfo({ // 获取当前设备的宽高，文档有
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          imgUrl: app.globalData.imgUrl,
          currentTab:0,
        })
      },
    })
  },
  onShow: function() {
    var that = this;
    //获取数据
    util.request(api.GetLimitItem).then(function(res) {
      console.log(res);
      if (res.code === 200) {
        that.setData({
          limitGoods: res.data.products,
          // trumpArr: res.data.products0,
          switchtab: res.data.time_list,
          backImage: res.data.image,
          id: res.data.id,
          currentTab:0,
          isEnd: res.data.is_end,
        });

        if (that.data.isEnd == 0 && res.data.products.length > 0) {
          that.creatTimer(res.data.stime, res.data.etime);
        }
      }
    });
  },
  creatTimer: function(stime, etime) {
    var that =this;
    var timestamp = Date.parse(new Date()) / 1000;
    var kill_time = etime;
    var spiking = true;
    if (timestamp < stime) {
      kill_time = stime;
      spiking = false;
    }
    //开启一个定时器
    let endTimeList = {
      'name': 'limitbuy',
      'endTime': kill_time,
    };
    that.setData({
      actEndTimeList: endTimeList,
      spiking: spiking,
    });
    that.countDown();
  },
  countDown: function () {
    let newTime = new Date().getTime() / 1000;
    let endTimeList = this.data.actEndTimeList;
    let endTime = endTimeList.endTime;
    let name = endTimeList.name;
    let obj = null;
    // 如果活动未结束，对时间进行处理
    if (endTime - newTime > 1) {
      let time = (endTime - newTime);
      // 获取天、时、分、秒
      let hou = this.prefixInteger(Math.floor(time / 3600), 2);
      let min = this.prefixInteger(Math.floor((time % 3600) / 60), 2);
      let sec = this.prefixInteger(Math.floor(time % 60), 2);
      obj = {
        name: name,
        hou: hou,
        min: min,
        sec: sec
      }
    } else { //活动已结束，全部设置为'00'
      obj = {
        name: name,
        hou: '00',
        min: '00',
        sec: '00'
      }
      this.getWindowInfo();
      return;
    }
    this.setData({
      countDownList: obj
    })
    setTimeout(this.countDown, 1000);
  },
  prefixInteger: function (num, length) {
    if (num < 10) {
      return (Array(length).join('0') + num).slice(-length);
    }
    return num;
  },
  buyitnow: function(e) {
    wx.navigateTo({
      url: '/pages/goods/goods?id=' + e.currentTarget.dataset.productId,
    })
  },
  //tab切换函数，让swiper当前滑块的current的index与tab头部index一一对应
  switchNav: function(e) {
    var that = this;
    var current = e.currentTarget.dataset.current //获取当前tab的index
    var tabWidth = that.data.windowWidth
    that.setData({
      tabScroll: (current - 2) * tabWidth //使点击的tab始终在居中位置
    })
    if (that.data.currentTab == current) {
      return false
    } else {
      //接口请求数据
      that.setData({
        id: e.currentTarget.dataset.id,
        currentTab: current
      });
      util.request(api.GetLimitItemInfo, {
        id: e.currentTarget.dataset.id,
        p: 1,
      }, 'POST').then(function(res) {
        console.log(res);
        if (res.code === 200) {
          that.setData({
            limitGoods: res.data.goodsList,
            currentTab: current,
            isEnd: res.data.is_end,
          });
          if (that.data.isEnd == 0){
             that.creatTimer(res.data.stime, res.data.etime);
          }
          
        }
      });
    }
  },
  onReachBottom(options) {
    let that = this;
    let page = that.data.page + 1;
    if (!that.data.load) {
      return;
    }
    util.request(api.GetLimitItemInfo, {
      id: that.data.id,
      p: page,
    },'POST').then(function(res) {
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
        that.setData({
          limitGoods: that.data.limitGoods.concat(res.data.goodsList),
          page: page
        });
      }
    });
  },
  getWindowInfo() {
    wx.getSystemInfo({ // 获取当前设备的宽高，文档有
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
        })
      },
    })
  },
  addToCart: function (e) {
    var that = this;
    var _id = e.currentTarget.dataset.id;
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