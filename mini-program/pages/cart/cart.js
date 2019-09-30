var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp();

Page({
  data: {
    cartGoods: [],
    cartTotal: {
      // "goodsCount": 110,
      // "goodsAmount": 110.00,
      // "checkedGoodsCount": 110,
      "checkedGoodsAmount": 0
    },
    isEditCart: true,
    checkedAllStatus: false,
    editCartList: [],
    showLoginDialog: false,
    wxTimerList: {},
    showtimer: {
      'notice': 0,
      'min': 0,
      'sec': 0,
    }
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  onPullDownRefresh: function () {
    this.getCartList();
    wx.stopPullDownRefresh();
  },
  onReady: function() {
    // 页面渲染完成

  },
  onShow: function() {
    if (wx.getStorageSync('access_token')) {
      this.setData({
        showLoginDialog: false
      });
    } else {
      this.setData({
        showLoginDialog: true
      });
    }
    // 页面显示
    this.getCartList();
  },
  onWechatLogin(e) {
    let that = this;
    if (e.detail.errMsg !== 'getUserInfo:ok') {
      if (e.detail.errMsg === 'getUserInfo:fail auth deny') {
        return false
      }
      return false
    }
    util.login().then((res) => {
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
        return;
      }

      if (res.code !== 200) {
        return false;
      }
      // 设置用户信息
      app.globalData.userInfo = res.data;
      app.globalData.access_token = res.data.access_token;
      wx.setStorageSync('userInfo', JSON.stringify(res.data));
      wx.setStorageSync('access_token', res.data.access_token);
      wx.setStorageSync('uuid', res.data.uuid);
      wx.setStorageSync('currency', res.data.currency);
      wx.setStorageSync('lang', res.data.lang);

      that.setData({
        showLoginDialog: false
      });
      that.getCartList();
    }).catch((err) => {
      console.log(err)
    })
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭
  },
  pickout: function(item_id) {
    var cartGoods = this.data.cartGoods;
    for (var i in cartGoods) {
      if (cartGoods[i].item_id == item_id) {
        cartGoods.splice(i, 1);
        this.setData({
          cartGoods: cartGoods
        });
        break;
      }
    }
  },
  getCartList: function() {
    let that = this;
    util.request(api.CartList).then(function(res) {
      // console.log(res);
      if (res.code == 300) {
        wx.switchTab({
          url: 'pages/ucenter/index/index'
        });
        return;
      }
      if (res.code === 200) {
        var grand_total = 0;
        var products = [];
        if (res.data.cart_info !== false && res.data.cart_info !== null) {
          products = res.data.cart_info.products;
          grand_total = res.data.cart_info.product_total;
        }
        let cartTotal = {
          "checkedGoodsAmount": grand_total
        }
        that.setData({
          cartGoods: products,
          cartTotal: cartTotal,
        });
        if (products.length > 0) {
          var timer = that.data.timer;
          console.log(timer);
          if (!timer) {
            that.countDown(172800, function(msg) {
              console.log(msg);
            })
          }
        }
      }
      that.setData({
        checkedAllStatus: that.isCheckedAll()
      });
    });
  },
  countDown: function(maxtime, fn) {
    let that = this;
    var newtimer = setInterval(function() {
      if (!!maxtime) {
        var day = Math.floor(maxtime / 86400),
          hour = Math.floor((maxtime % 86400) / 3600),
          minutes = that.prefixInteger(Math.floor((maxtime % 3600) / 60), 2),
          seconds = that.prefixInteger(Math.floor(maxtime % 60), 2);
        --maxtime;
        var cartTimer = app.globalData.cartTimer;
        if (cartTimer == 172800) {
          app.globalData.cartTimer = 0;
          maxtime = cartTimer;
        }
        that.setData({
          ["showtimer.notice"]: 1,
          ["showtimer.day"]: day,
          ["showtimer.hour"]: hour,
          ["showtimer.min"]: minutes,
          ["showtimer.sec"]: seconds,
        });
        if (maxtime == 300) {
          wx.showModal({
            title: '温馨提示',
            content: '购物车即将被清空,请快下单喔~',
            success: function(res) {
              if (res.confirm) {
                wx.switchTab({
                  url: '/pages/cart/cart'
                })
              }
            }
          })
        }
      } else {
        clearInterval(newtimer);
        that.setData({
          timer: null,
          ["showtimer.notice"]: 0,
        });
        that.clearCartItem();
      }
    }, 1000);

    that.setData({
      timer: newtimer
    });
  },
  prefixInteger: function(num, length) {
    return (Array(length).join('0') + num).slice(-length);
  },
  //删除item
  clearCartItem: function() {
    let that = this;
    util.request(api.ClearCartGoods, {}, 'POST').then(function(res) {
      console.log(res);
      if (res.code == 200) {
        that.setData({
          'cartGoods': []
        });
      }
    });
  },
  isCheckedAll: function() {
    //判断购物车商品已全选
    return this.data.cartGoods.every(function(element, index, array) {
      if (element.active == 1) {
        return true;
      } else {
        return false;
      }
    });
  },
  checkedItem: function(event) {
    let itemIndex = event.target.dataset.itemIndex;
    let that = this;
    util.request(api.CartChecked, {
      item_id: that.data.cartGoods[itemIndex].item_id,
      checked: that.data.cartGoods[itemIndex].active ? 0 : 1
    }).then(function(res) {
      console.log(res);
      if (res.code === 200) {
        let cartTotal = {
          "checkedGoodsAmount": res.data.product_total,
        }
        let active = `cartGoods[${itemIndex}].active`;
        that.setData({
          [active]: res.data.active,
          cartTotal: cartTotal,
          checkedAllStatus: that.isCheckedAll()
        });
      }
    });
    // if (!this.data.isEditCart) {
    //   console.log('单选1后的返回');
    //   console.log(that.data.cartGoods[itemIndex].active);
    //   console.log(that.data.cartGoods[itemIndex].item_id);

    // } else {
    //   //编辑状态
    //   let tmpCartData = this.data.cartGoods.map(function(element, index, array) {
    //     if (index == itemIndex) {
    //       element.active = element.active == 1 ? 0 : 1;
    //     }
    //     return element;
    //   });

    // that.setData({
    //   cartGoods: tmpCartData,
    //   checkedAllStatus: that.isCheckedAll(),
    //   // 'cartTotal.checkedGoodsCount': that.getCheckedGoodsCount()计算选择后的总数
    // });
    // }
  },
  getCheckedGoodsCount: function() {
    let checkedGoodsCount = 0;
    this.data.cartGoods.forEach(function(v) {
      if (v.checked === true) {
        checkedGoodsCount += v.number;
      }
    });
    return checkedGoodsCount;
  },
  checkedAll: function() {
    let that = this;
    if (!this.data.isEditCart) {
      var item_ids = this.data.cartGoods.map(function(v) {
        return v.item_id;
      });
      var isChecked = that.isCheckedAll() ? 0 : 1;
      util.request(api.CartCheckedAll, {
        checked: isChecked
      }).then(function(res) {
        console.log(res);
        if (res.code === 200) {
          let cartTotal = {
            "checkedGoodsAmount": res.data.cart_info.product_total
          }
          that.setData({
            cartGoods: res.data.cart_info.products,
            cartTotal: cartTotal,
          });
        }

        that.setData({
          checkedAllStatus: that.isCheckedAll()
        });
      });
    } else {
      //编辑状态
      let checkedAllStatus = that.isCheckedAll();
      var isChecked = checkedAllStatus ? 0 : 1;
      util.request(api.CartCheckedAll, {
        checked: isChecked
      }).then(function(res) {
        if (res.code === 200) {
          let cartTotal = {
            "checkedGoodsAmount": res.data.cart_info.product_total
          }
          that.setData({
            cartGoods: res.data.cart_info.products,
            cartTotal: cartTotal,

          });
        }
        that.setData({
          checkedAllStatus: that.isCheckedAll()
        });
      });

      // let tmpCartData = this.data.cartGoods.map(function(v) {
      //   v.active = isChecked;
      //   return v;
      // });
      // that.setData({
      //   cartGoods: tmpCartData,
      //   checkedAllStatus: that.isCheckedAll()
      // });
    }

  },
  editCart: function() {
    var that = this;
    console.log(this.data.isEditCart);
    if (this.data.isEditCart) {
      this.getCartList();
      this.setData({
        isEditCart: !this.data.isEditCart
      });
    } else {
      //编辑状态
      let tmpCartList = this.data.cartGoods.map(function(v) {
        v.checked = false;
        return v;
      });

      this.setData({
        editCartList: this.data.cartGoods,
        cartGoods: tmpCartList,
        isEditCart: !this.data.isEditCart,
        checkedAllStatus: that.isCheckedAll()
      });
    }

  },
  updateCart: function(item_id, itemIndex, up_type) {
    let that = this;

    util.request(api.CartUpdate, {
      item_id: item_id,
      up_type: up_type,
    }, 'POST').then(function(res) {
      console.log(res);
      if (res.code === 200) {
        let cartTotal = {
          "checkedGoodsAmount": res.data.product_total,
        }
        let qty = `cartGoods[${itemIndex}].qty`;
        that.setData({
          [qty]: res.data.qty,
          cartTotal: cartTotal
        });
      }

      that.setData({
        checkedAllStatus: that.isCheckedAll()
      });
    });

  },
  cutNumber: function(event) {

    let itemIndex = event.target.dataset.itemIndex;
    let cartItem = this.data.cartGoods[itemIndex];
    console.log(cartItem);
    this.updateCart(cartItem.item_id, itemIndex, 'less_one');
  },
  addNumber: function(event) {
    let itemIndex = event.target.dataset.itemIndex;
    let cartItem = this.data.cartGoods[itemIndex];
    console.log(cartItem);
    this.updateCart(cartItem.item_id, itemIndex, 'add_one');

  },
  checkoutOrder: function() {
    //获取已选择的商品
    let that = this;

    var checkedGoods = this.data.cartGoods.filter(function(element, index, array) {
      if (element.active == 1) {
        return true;
      } else {
        return false;
      }
    });

    if (checkedGoods.length <= 0) {
      wx.showToast({
        title: '请选择商品',
      })
      return false;
    }

    wx.navigateTo({
      url: '../shopping/checkout/checkout?product_id=&qty=0&custom_option=',
    })
  },
  deleteCart: function() {
    //获取已选择的商品
    let that = this;

    let item_ids = this.data.cartGoods.filter(function(element, index, array) {
      if (element.active == 1) {
        return true;
      } else {
        return false;
      }
    });
    console.log(item_ids);
    if (item_ids.length <= 0) {
      return false;
    }

    item_ids = item_ids.map(function(element, index, array) {
      if (element.active == 1) {
        return element.item_id;
      }
    });

    util.request(api.CartDelete, {
      item_ids: item_ids.join(',')
    }, 'POST').then(function(res) {
      if (res.code === 200) {
        console.log(res);
        let cartList = [];
        let cartTotal = {};
        let isEditCart = true;
        if (res.data.cart_info) {
          cartList = res.data.cart_info.products.map(v => {
            console.log(v);
            v.active = 0;
            return v;
          });
          cartTotal = {
            "checkedGoodsAmount": res.data.cart_info.product_total
          }
        } else {
          isEditCart = false;
        }
        that.setData({
          cartGoods: cartList,
          cartTotal: cartTotal,
          isEditCart: isEditCart
        });
      }

      that.setData({
        checkedAllStatus: that.isCheckedAll()
      });
    });
  },
  //删除单个
  deleteOneCartItem: function (e) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          // 用户点击了确定 可以调用删除方法了
          //获取已选择的商品
          
          var item_id = e.currentTarget.dataset.id;

          util.request(api.DelCartGoods, {
            item_id: item_id
          }, 'POST').then(function (res) {
            if (res.code === 200) {
              console.log(res);
              let cartList = [];
              let cartTotal = {};
              let isEditCart = true;
              if (res.data.cart_info) {
                cartList = res.data.cart_info.products;
                cartTotal = {
                  "checkedGoodsAmount": res.data.cart_info.product_total
                }
              } else {
                isEditCart = false;
              }
              that.setData({
                cartGoods: cartList,
                cartTotal: cartTotal,
                isEditCart: isEditCart
              });
              util.showSuccessToast('删除成功');
            }

            that.setData({
              checkedAllStatus: that.isCheckedAll()
            });

          });
        } else if (sm.cancel) {
          return;
        }
      }
     });

  },
  onPullDownRefresh(options) {
    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画。
    //重新获取数据
    this.getCartList();
    wx.hideNavigationBarLoading(); //隐藏导航条加载动画。
    wx.stopPullDownRefresh(); //停止当前页面下拉刷新。
  }

})