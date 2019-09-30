var app = getApp();
Page({
  data: {
  },

  goOrder:function()
  {
    wx.navigateTo({
      url: '/pages/ucenter/order/order',
    })
  },
  goIndex: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  onLoad: function () {
    
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
  }
})