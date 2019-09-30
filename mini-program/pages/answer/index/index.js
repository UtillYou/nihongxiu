var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();

Page({
  data: {
    list: [],
    pickerShow: false,
    sensitive: []
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数

  },
  bindPickerChange: function(e) {
    let id = e.currentTarget.dataset.id;
    let index = parseInt(e.detail.value);
    let list = this.data.list;
    for (var i in list) {
      if (list[i].id == id) {
        list[i].choice = index;
        list[i].m_name = list[i].answer.name[index];
        break;
      }
    }
    this.setData({
      list: list
    });
    wx.setStorageSync('acne', index + 1)
  },
  onReady: function() {
    // 页面渲染完成
    this.SkinList();
  },
  onShow: function() {
    // 页面显示
    if (wx.getStorageSync('answer_back') == 1) {
      wx.setStorageSync('answer_back', '');
      this.setData({
        pickerShow: false
      });
    }
    var list = this.data.list;
    var skin = wx.getStorageSync('skin');
    var acne = wx.getStorageSync('acne');
    var sensitive = wx.getStorageSync('sensitive');
    if (list.length>0) {
      if (skin != '') {
        list[0].m_name = list[0].answer.name[skin - 1];
      }
      if (acne != '') {
        list[1].m_name = list[1].answer.name[acne - 1];
      }
      if (sensitive != '') {
        list[2].m_name = list[2].answer.name[sensitive - 1];
      }
      this.setData({
        list: list
      });
    }
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭
  },

  SkinList: function() {
    let that = this;
    util.request(api.SkinList).then(function(res) {
      console.log(res);
      if (res.code === 200) {
        let sensitive = [];
        let list = res.data.list;
        for (var i in list) {
          if (list[i].id == 3) {
            sensitive = list[i].answer.name
          }
        }
        that.setData({
          list: list,
          sensitive: sensitive
        });
      }
    });
  },
  gotoCheck: function(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/answer/answer/answer?id=' + id,
    })
  },
  showSheet: function(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let list = this.data.list;
    let itemList = [];
    for (var i in list) {
      if (list[i].id == id) {
        itemList = list[i].answer.description;
      }
    }

    wx.showActionSheet({
      itemList: itemList,
      success(res) {
        let index = res.tapIndex;
        // let value = '';
        for (var i in list) {
          if (list[i].id == id) {
            list[i].choice = index;
            list[i].m_name = list[i].answer.name[index];
            break;
          }
        }
        that.setData({
          list: list
        });
        //保存用户的选择
        wx.setStorageSync('skin', index + 1)
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  pickerHandler: function() {
    this.setData({
      pickerShow: true
    });
  },
  finishHandler(e) {
    console.log(e.detail) // 选择的结果是索引值
    let index = e.detail;
    let list = this.data.list;
    // let value = '';
    for (var i in list) {
      if (list[i].id == 3) {
        list[i].choice = index;
        list[i].m_name = list[i].answer.name[index];
        break;
      }
    }
    this.setData({
      list: list
    });
    //保存用户的选择
    wx.setStorageSync('sensitive', index + 1)
    // util.request(api.SkinSave, {
    //   'sensitive': index + 1
    // }, 'POST').then(function(res) {
    //   console.log(res);
    //   if (res.code === 200) {}
    // });

  },
  checkHandler(e) {
    wx: wx.navigateTo({
      url: '/pages/answer/answer/answer',
    })
  },
  myFuzhi: function() {
    wx.navigateTo({
      url: '/pages/skin/skin',
    })
  }
})