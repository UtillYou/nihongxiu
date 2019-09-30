const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');
const user = require('../../../services/user.js');
const app = getApp();

Page({
  data: {
    userInfo: {},
    showLoginDialog: false,
    imgUrl : '',
    collectBackImage: "/static/images/icon_collect.png",
  },
  onLoad: function(options) {
    var that = this;
    if (wx.getStorageSync('access_token')) {
        
    } else {
      that.setData({
        showLoginDialog: true,
      });
    }
    that.setData({
      imgUrl: app.globalData.imgUrl,
    });
  },
  onReady: function() {

  },
  onShow: function() {
    this.setData({
      userInfo: app.globalData.userInfo,
    });
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭
  },

  onUserInfoClick: function() {
    if (wx.getStorageSync('access_token')) {

    } else {
      this.showLoginDialog();
    }
  },

  showLoginDialog() {
    this.setData({
      showLoginDialog: true
    })
  },

  onCloseLoginDialog() {

    // this.setData({
    //   showLoginDialog: false
    // })
  },

  onDialogBody() {
    // 阻止冒泡
  },

  onWechatLogin(e) {
    if (e.detail.errMsg !== 'getUserInfo:ok') {
    //   if (e.detail.errMsg === 'getUserInfo:fail auth deny') {
    //     return false
    //   }
      return false;
    }
    util.login().then((res) => {
      console.log(res)
      console.log(e.detail.userInfo)
      return util.request(api.AuthLoginByWeixin, {
        code: res,
        userinfo: e.detail.userInfo
      }, 'POST');
    }).then((res) => {
      console.log(res)
      if (res.code == 110006) {
        this.setData({
          showLoginDialog: false
        });
        return ;
      }
      if (res.code !== 200) {
        return false;
      }
      // 设置用户信息
      this.setData({
        userInfo: res.data,
        showLoginDialog: false
      });
      app.globalData.userInfo = res.data;
      app.globalData.access_token = res.data.access_token;
      wx.setStorageSync('userInfo', JSON.stringify(res.data));
      wx.setStorageSync('access_token', res.data.access_token);
      wx.setStorageSync('uuid', res.data.uuid);
      wx.setStorageSync('currency', res.data.currency);
      wx.setStorageSync('lang', res.data.lang);
    }).catch((err) => {
      console.log(err)
    })
  },

  onOrderInfoClick: function(event) {
    wx.navigateTo({
      url: '/pages/ucenter/order/order',
    })
  },

  onSectionItemClick: function(event) {

  },

  // TODO 移到个人信息页面
  exitLogin: function() {
    wx.showModal({
      title: '',
      confirmColor: '#b4282d',
      content: '退出登录？',
      success: function(res) {
        if (res.confirm) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      }
    })

  }
})