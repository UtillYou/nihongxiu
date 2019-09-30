var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();
Page({
  data: {
    statusType: [{
        'name': '全部',
        'curType': '',
      },
      {
        'name': '待付款',
        'curType': 'payment_pending',
      },
      {
        'name': '待发货',
        'curType': 'payment_confirmed',
      },
      {
        'name': '待收货',
        'curType': 'dispatched',
      },
      {
        'name': '待评价',
        'curType': 'review', //新增字段
      },
      {
        'name': '已完成',
        'curType': 'completed',
      }
    ],
    currentType: '',
    tabClass: ["", "", "", "", ""],
    page: 1,
    page_size:10,
    load: true,
    showLoginDialog: false
  },
  statusTap: function(e) {
    const curType = e.currentTarget.dataset.curtype;
    this.data.currentType = curType
    this.setData({
      currentType: curType,
      page: 1
    });
    this.onShow();
  },
  orderDetail: function(e) {
    var orderId = e.currentTarget.dataset.orderId;
    wx.navigateTo({
      url: "/pages/ucenter/orderDetail/orderDetail?id=" + orderId
    })
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
        return;
      }
      if (res.code !== 200) {
        if (res.code == 110003){
          this.setData({
            showLoginDialog: true,
          });
        }
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
      // 获取订单列表
      var that = this;
      that.getOrderStatistics();
      that.onOrderList();

    }).catch((err) => {
      console.log(err)
    })
  },

  reviewOrder:function(e)
  {
    var orderId = e.currentTarget.dataset.orderId;
    wx.navigateTo({
      url: "/pages/ucenter/evaluation/evaluation?id=" + orderId
    })

  },

  cancelOrderTap: function(e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function(res) {
        if (res.confirm) {
          WXAPI.orderClose(orderId, wx.getStorageSync('token')).then(function(res) {
            if (res.code == 0) {
              that.onShow();
            }
          })
        }
      }
    })
  },
  toPayTap: function(e) {
    const that = this;
    const orderId = e.currentTarget.dataset.id;
    let money = e.currentTarget.dataset.money;
    const needScore = e.currentTarget.dataset.score;
    WXAPI.userAmount(wx.getStorageSync('token')).then(function(res) {
      if (res.code == 0) {
        // 增加提示框
        if (res.data.score < needScore) {
          wx.showToast({
            title: '您的积分不足，无法支付',
            icon: 'none'
          })
          return;
        }
        let _msg = '订单金额: ' + money + ' 元'
        if (res.data.balance > 0) {
          _msg += ',可用余额为 ' + res.data.balance + ' 元'
          if (money - res.data.balance > 0) {
            _msg += ',仍需微信支付 ' + (money - res.data.balance) + ' 元'
          }
        }
        if (needScore > 0) {
          _msg += ',并扣除 ' + money + ' 积分'
        }
        money = money - res.data.balance
        wx.showModal({
          title: '请确认支付',
          content: _msg,
          confirmText: "确认支付",
          cancelText: "取消支付",
          success: function(res) {
            console.log(res);
            if (res.confirm) {
              that._toPayTap(orderId, money)
            } else {
              console.log('用户点击取消支付')
            }
          }
        });
      } else {
        wx.showModal({
          title: '错误',
          content: '无法获取用户资金信息',
          showCancel: false
        })
      }
    })
  },
  onLoad: function(options) {
    if (options && options.type) {
      this.setData({
        currentType: options.type
      });
    }
    var that = this;
    if (wx.getStorageSync('access_token')) {

    } else {
      that.setData({
        showLoginDialog: true,
      });
    }
  },
  onReady: function() {
  },
  getOrderStatistics: function() {
    var that = this;
    util.request(api.OrderStatistics).then(function (res) {
      if (res.code === 200) {
        var tabClass=[];
        if (res.data.statistics.count_id_no_pay > 0) {
          tabClass[1] = "red-dot"
        } else {
          tabClass[1] = ""
        }
        if (res.data.statistics.count_id_no_transfer > 0) {
          tabClass[2] = "red-dot"
        } else {
          tabClass[2] = ""
        }
        if (res.data.statistics.count_id_no_confirm > 0) {
          tabClass[3] = "red-dot"
        } else {
          tabClass[3] = ""
        }
        if (res.data.statistics.count_id_no_reputation > 0) {
          tabClass[4] = "red-dot"
        } else {
          tabClass[4] = ""
        }

        that.setData({
          tabClass: tabClass,
        });
      }
    });
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
    // 获取订单列表
    var that = this;
    that.getOrderStatistics();
    that.onOrderList();
  },
  onOrderList:function(){
    var that = this;
    util.request(api.OrderList, {
      p: 1,
      page_size: that.data.page_size,
      pstatus: that.data.currentType
    }).then(function (res) {
      console.log(res);
      if (res.code === 200) {
        console.log(res.data);
        that.setData({
          orderList: res.data.orderList,
          load: true
        });
      }
    });
  },
  onReachBottom(options) {
    let that = this;
    let page = that.data.page + 1;
    if (!that.data.load) {
      return;
    }
    util.request(api.OrderList, {
      pstatus: that.data.currentType,
      p: page,
      page_size: that.data.page_size,
    }).then(function (res) {
      console.log(res);
      if (res.code === 200) {
        if (res.data.orderList.length == 0) {
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
          orderList: that.data.orderList.concat(res.data.orderList),
          page: page
        });
      }
    });
  },
  payOrder(event) {
    let order_id = event.currentTarget.dataset.orderId;
    console.log(order_id);
    util.request(api.PayUnpaidOrder, {
      order_id: order_id,
    }, 'POST').then(function (res) {
      console.log(res);
      if (res.code === 200) {
        //调用微信支付
        util.request(api.WxPay, {}, 'POST').then(res => {
          console.log(res);
          if (res.code === 200) {
            wx.requestPayment({
              timeStamp: res.data.timeStamp,
              nonceStr: res.data.nonceStr,
              package: res.data.package,
              signType: 'MD5',
              paySign: res.data.paySign,
              success(res) {
                console.log(res);
                if (res.errMsg == 'requestPayment:ok') {
                  util.request(api.WxPaySuccess, {}, 'POST').then(__res => {
                    if (__res.code == 200) {
                      //跳转到支付成功页面，调用支付成功接口
                      wx.navigateTo({
                        url: '/pages/shopping/paySuccess/paySuccess?id=' + __res.data.order.order_id,
                      })
                    }
                  })
                }
              },
              fail(res) {
                console.log(res);

                //支付失败跳转到订单列表
                util.showErrorToast('支付失败');
              }
            })
          } else {
            util.showErrorToast('调起支付失败');
          }
        });

      }else{
        util.myalert(res.message);
      }
    });
  },

  queryLogistics:function(e){
    var incrementId = e.currentTarget.dataset.incrementId;
    wx.navigateTo({
      url: '/pages/ucenter/express/express?id=' + incrementId,
    })
  },
  buyorder:function(e)
  {
    var orderId = e.currentTarget.dataset.orderId;
    console.log(orderId);
    util.request(api.BuyOrder, {
      order_id: orderId,
    }, 'POST').then(function (res) {
      console.log(res);
      if (res.code === 200) {
        wx.navigateTo({
          url: '/pages/shopping/checkout/checkout',
        })
      }
    })
  },
  completedorder: function (e) {
    var orderId = e.currentTarget.dataset.orderId;
    console.log(orderId);
    util.request(api.CompletedOrder, {
      order_id: orderId,
    }, 'POST').then(function (res) {
      console.log(res);
      if (res.code === 200) {
        wx.navigateTo({
          url: '/pages/ucenter/order/order',
        })
      }else{
        wx.showToast({
           title: res.message,
        });
      }
    })

  },
  onHide: function() {
    // 生命周期函数--监听页面隐藏

  },
  onUnload: function() {
    // 生命周期函数--监听页面卸载

  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作

  },
  onDialogBody:function(){
    
  }
})