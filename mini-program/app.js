App({
  onLaunch: function () {
    try {
      this.globalData.userInfo = JSON.parse(wx.getStorageSync('userInfo'));
      this.globalData.access_token = wx.getStorageSync('access_token');
      this.globalData.uuid = wx.getStorageSync('uuid');
    } catch (e) {
      console.log(e);
    }
  },

  globalData: {
    userInfo: {
      nickname: '点击登陆',
      avatar: '/static/images/default_avatar.png'
    },
    access_token: '',
    uuid:'',
    cartTimer:0,
    imgUrl: 'http://xwjxcximg.dongluting.com',//服务器图片域名
  },
})