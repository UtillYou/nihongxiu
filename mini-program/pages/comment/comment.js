var app = getApp();
var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    comments: [],
    allCommentList: [],
    picCommentList: [],
    typeId: 0,
    valueId: 0,
    size: 10,
    page:1,
    load:true,
  },
  getCommentCount: function () {
    let that = this;
    util.request(api.CommentCount, { valueId: that.data.valueId, typeId: that.data.typeId}).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          allCount: res.data.allCount,
          hasPicCount: res.data.hasPicCount
        });
      }
    });
  },
  getCommentList: function(){
    
    let that = this;
    
    util.request(api.CommentList, { 
      product_id: that.data.valueId, 
      p: 1
      }).then(function (res) {
        console.log(res);
      if (res.code === 200) {
        that.setData({
          load: false,
          comments: that.data.comments.concat(res.data.reviewList)
        });
      }
    });
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      typeId: options.typeId,
      valueId: options.valueId
    });

    // this.getCommentCount();
    this.getCommentList();
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
  switchTab: function () {
    this.setData({
      showType: this.data.showType == 1 ? 0 :1
    });

    this.getCommentList();
  },
  onReachBottom: function(){
    let that = this;
    let page = that.data.page + 1;
    if (!that.data.load) {
      return;
    }
    util.request(api.CommentList, {
      product_id: that.data.valueId,
      p: page
    }).then(function (res) {
      if (res.code === 200) {
        if (res.data.reviewList.length == 0) {
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
          page: page,
          comments: that.data.comments.concat(res.data.reviewList)
        });
      }
    });
  }
})