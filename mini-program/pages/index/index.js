const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../services/user.js');
const timer = require('../../utils/wxTimer.js')
//获取应用实例
const app = getApp()
Page({
  data: {
    goodsCount: 0,
    limitByGoods: [],
    newGoods: [],
    hotGoods: [],
    topics: [],
    brands: [],
    floorGoods: [],
    banner: [],
    channel: [],
    wxTimerList: {},
    length: [],
    page: 1,
    load: true,
    countDownList: {},
    actEndTimeList: {},
    spiking: false,
    productshow:[],
  },
  onShareAppMessage: function() {
    return {
      title: '东鹿町小拼拼',
      desc: '东鹿町小拼拼微信小程序商城',
      path: '/pages/index/index',
      success: function(res) {
        console.log(res);
      }
    }
  },

  getIndexData: function() {
    let that = this;
    util.request(api.IndexUrl).then(function(res) {
      // console.log(res.data);
      if (res.code === 200) {
        that.setData({
          hotGoods: res.data.hotGoodsList,
          dialogData: res.data.popups,
          banner: res.data.banner,
          productshow: res.data.productshow,
        });
        if (res.data.hotGoodsList.length <= 0){
          that.setData({
            load : false,
          });
        }
        if (res.data.limitByGoods.length>0){
          that.setData({
            limitByGoods: res.data.limitByGoods.products,
          });
          if (res.data.limitByGoods.products.length > 0) {
            var timestamp = Date.parse(new Date()) / 1000;
            var timer = res.data.limitByGoods.etime;
            var spiking = true;
            if (timestamp < res.data.limitByGoods.stime) {
              timer = res.data.limitByGoods.stime;
              spiking = false;
            }
            let endTimeList = {
              'name': 'spike',
              'endTime': timer,
            };
            that.setData({
              actEndTimeList: endTimeList,
              spiking: spiking,
            });
            that.countDown();
          }
        }
      }
    });
  },
  onLoad: function(options) {
    this.getIndexData();

  },
  clickBanner: function(e) {
    var type = e.currentTarget.dataset.type;
    if (type == 1) {
      wx.navigateTo({
        url: '/pages/goods/goods?id=' + e.currentTarget.dataset.id
      })
    }
    if (type == 2) {
      wx.navigateTo({
        url: '/pages/category/category?id=' + e.currentTarget.dataset.id
      })
    }
    if (type == 3) {
      wx.navigateTo({
        url: '/pages/article/article?id=' + e.currentTarget.dataset.id
      })
    }
    if (type == 4) {
      wx.navigateTo({
        url: '/pages/essay/essay?url_key=' + e.currentTarget.dataset.id,
      })
    }
    //跳秒杀
    if (type == 5) {
      wx.navigateTo({
        url: '/pages/limitBuy/limitBuy',
      })
    }
  },
  // goTopicinfo: function(e) {
  //   wx.navigateTo({
  //     url: '/pages/topic/topic?id=' + e.currentTarget.dataset.topicId
  //   })
  // },
  gotolimitbuy: function() {
    wx.navigateTo({
      url: '/pages/limitBuy/limitBuy',
    })
  },
  goToSaoMao: function() {
    wx.navigateTo({
      url: '/pages/joinGroup/joinGroup',
    })
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
  countDown: function() {
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
      this.onload();
      return;
    }
    this.setData({
      countDownList: obj
    })
    setTimeout(this.countDown, 1000);
  },
  prefixInteger: function(num, length) {
    if (num < 10) {
      return (Array(length).join('0') + num).slice(-length);
    }
    return num;
  },
  dialog_click: function(e) {
    var type = e.currentTarget.dataset.type;
    var jumpId = e.currentTarget.dataset.jumpId;
    switch (type) {
      case 1:
        wx.navigateTo({
          url: '/pages/goods/goods?id=' + jumpId
        });
        break;
      case 2:
        wx.navigateTo({
          url: '/pages/category/category?id=' + jumpId
        });
        break;
      case 3:
        wx.navigateTo({
          url: '/pages/topic/topic?id=' + jumpId
        });
        break;
    }
  },
  close_mask: function() {
    this.setData({
      ["dialogData.flag"]: false
    })
  },
  onPullDownRefresh: function() {
    this.onLoad();
    wx.stopPullDownRefresh();
  },
  onReachBottom(options) {
    let that = this;
    let page = that.data.page + 1;
    if (!that.data.load) {
      return;
    }
    util.request(api.GoodsHot, {
      p: that.data.page,
    }).then(function(res) {
      console.log(res);
      if (res.code === 200) {
        if (res.data.goodsList.length == 0) {
          //没有数据
          that.setData({
            load: false
          });
         
          return;
        }
        that.setData({
          hotGoods: that.data.hotGoods.concat(res.data.goodsList),
          page: page
        });
      }
    });
  }
})