var app = getApp();
var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    list: [],
    navData: [],
    goodsList: [],
    currentTab: 0,
    navScrollLeft: 0,
    page: 1,
    load: true,
    description: '',
  },
  //事件处理函数
  onLoad: function() {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          pixelRatio: res.pixelRatio,
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      },
    })
  },
  onShow: function() {
    let that = this;
    let skin = wx.getStorageSync('skin');
    let acne = wx.getStorageSync('acne');
    let sensitive = wx.getStorageSync('sensitive');
    skin = skin ? skin : 1;
    acne = acne ? acne : 1;
    sensitive = sensitive ? sensitive : 1;
    console.log(skin, acne, sensitive);
    util.request(api.MySkinInit, {
      skin: skin,
      acne: acne,
      sensitive: sensitive
    }, 'POST').then(function(res) {
      console.log(res);
      if (res.code === 200) {

        var description = res.data.category[0].description ? res.data.category[0].description : '';
        that.setData({
          list: res.data.list,
          navData: res.data.category,
          goodsList: res.data.goodsList,
          description: description
        });
      }
    });
  },
  getdescription(category) {
    var navData = this.data.navData;
    for (var i in navData) {
      if (navData[i].id == category) {
        return navData[i].description;
      }
    }
    return '';
  },
  selectTap(e) {

    let list = this.data.list;
    let id = e.currentTarget.dataset.id;
    for (var i in list) {
      if (list[i].id == id) {
        list[i].show = !list[i].show;
      } else {
        list[i].show = false;
      }
    }
    this.setData({
      list: list
    });
  },

  // 点击下拉列表

  optionTap(e) {
    let that = this;
    let id = e.currentTarget.dataset.id; //
    let index = e.currentTarget.dataset.index; //获取点击的下拉列表的下标
    let list = that.data.list;
    for (var i in list) {
      if (list[i].id == id) {
        list[i].index = index;
        list[i].show = false;
      }
    }
    that.setData({
      list: list,
    });

    let skin = '';
    let acne = '';
    let sensitive = '';
    for (var j in list) {
      if (list[j].id == 1) {
        skin = list[j].index + 1;
      }
      if (list[j].id == 2) {
        acne = list[j].index + 1;
      }
      if (list[j].id == 3) {
        sensitive = list[j].index + 1;
      }
    }
    let currentTab = this.data.currentTab;
    let navData = this.data.navData;
    let categoryId = navData[currentTab] ? navData[currentTab].id : '';
    //刷新商品
    util.request(api.SkinGoods, {
      'skin': skin,
      'acne': acne,
      'sensitive': sensitive,
      'category': categoryId,
      'p': that.data.page,
    }).then(function(res) {
      console.log(res);
      if (res.code === 200) {
        that.setData({
          goodsList: res.data.goodsList,
        });
      }
    });

    //保存
    wx.setStorageSync('skin', skin);
    wx.setStorageSync('acne', acne);
    wx.setStorageSync('sensitive', sensitive);
    // util.request(api.SkinSave, {
    //   'skin': skin,
    //   'acne': acne,
    //   'sensitive': sensitive
    // }, 'POST').then(function(res) {
    //   console.log(res);
    //   if (res.code === 200) {}
    // });

  },
  switchNav(event) {
    let that = this;
    let list = that.data.list;
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
      let skin = '';
      let acne = '';
      let sensitive = '';
      for (var i in list) {
        if (list[i].id == 1) {
          skin = list[i].data.value[list[i].index];
        }
        if (list[i].id == 2) {
          acne = list[i].data.value[list[i].index];
        }
        if (list[i].id == 3) {
          sensitive = list[i].data.value[list[i].index];
        }
      }

      let navData = this.data.navData;
      let categoryId = navData[cur] ? navData[cur].id : '';
      this.setData({
        currentTab: cur,
        description: this.getdescription(categoryId),
      })

      //刷新商品
      util.request(api.SkinGoods, {
        'skin': skin,
        'acne': acne,
        'sensitive': sensitive,
        'category': categoryId,
        'p': 1,
      }).then(function(res) {
        console.log(res);
        if (res.code === 200) {
          that.setData({
            goodsList: res.data.goodsList,
          });
        }
      });

    }
  },
  switchTab(event) {
    var cur = event.detail.current;
    var singleNavWidth = this.data.windowWidth / 5;
    this.setData({
      currentTab: cur,
      navScrollLeft: (cur - 2) * singleNavWidth
    });
  },
  gotoCheck: function() {
    wx.navigateTo({
      url: '/pages/answer/index/index',
    })
  },
  //上滑加载数据
  onReachBottom(options) {
    console.log('下滑到底');
    let that = this;
    let page = this.data.page + 1;
    console.log(that.data.load);
    if (!that.data.load) {
      return;
    }
    let skin = '';
    let acne = '';
    let sensitive = '';
    let list = this.data.list;
    for (var j in list) {
      if (list[j].id == 1) {
        skin = list[j].index + 1;
      }
      if (list[j].id == 2) {
        acne = list[j].index + 1;
      }
      if (list[j].id == 3) {
        sensitive = list[j].index + 1;
      }
    }
    let navData = this.data.navData;
    let categoryId = navData[this.data.currentTab] ? navData[this.data.currentTab].id : '';
    util.request(api.SkinGoods, {
      'skin': skin,
      'acne': acne,
      'sensitive': sensitive,
      'category': categoryId,
      'p': page,
    }).then(function(res) {
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
          goodsList: that.data.goodsList.concat(res.data.goodsList),
          page: page
        });
      }
    });

  }
})