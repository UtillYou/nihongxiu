var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
const pay = require('../../../services/pay.js');

var app = getApp();

Page({
  data: {
    checkedGoodsList: [],
    checkedAddress: [],
    checkedCoupon: [],
    couponCount: 0,
    goodsTotalPrice: 0.00, //商品总价
    freightPrice: 0.00, //快递费
    couponPrice: 0.00, //优惠券的价格
    orderTotalPrice: 0.00, //订单总价
    showOrderTotalPrice: 0.00, //展示的价格
    actualPrice: 0.00, //实际需要支付的总价
    taxTotal:0.00,//税费
    crossBorderTax: 0.00,//需缴纳商品销售总金额9.1%的跨境电商税。
    couponId: 0,
    shipping_method: '',
    payment_method: '',
    order_remark: '',
    score_arr: [],
    score: 0, //用户选择的积分
    score_discount: 0.00, //积分抵扣金额
    billing: {
      'address_id': 0
    },
    buttonClicked: false,
    product_id:'',
    qty:1,
    custom_option:'',
    free_price:388,
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数

    try {
      var addressId = wx.getStorageSync('addressId');
      if (addressId) {
        this.setData({
          ["billing.address_id"]: addressId
        });
      }
    } catch (e) {
      // Do something when catch error
    }
  
    if (options){
      this.setData({
        product_id: options.product_id,
        qty: options.qty,
        custom_option: options.custom_option,
      });
    }
    this.getCheckoutInfo();

  },
  getCheckoutInfo: function() {
    let that = this;
    util.request(api.CartCheckout, {
      address_id: that.data.billing.address_id,
      coupon_id: that.data.couponId,
      product_id: that.data.product_id,
      qty: that.data.qty,
      custom_option: that.data.custom_option,
    }).then(function(res) {
      console.log(res);

      if (res.code === 200) {
        console.log(res.data);
        var default_address = {
          'address_id': 0
        };
        var address_list = res.data.address_list;
        for (var j in address_list) {
          //如果是选择了地址，跳转过来，则this.data.addressId有值，否则取默认地址
          if (that.data.billing.address_id != 0 && that.data.billing.address_id == address_list[j].address_id) {
            default_address = address_list[j];
            break;
          }
          if (address_list[j].is_default == 1) {
            default_address = address_list[j];
          }
        }
        wx.setStorage({
          key: 'couponlist',
          data: res.data.coupon,
        });
        let current_payment_method = '';
        let current_shipping_method = '';
        let payment_method_label = '';
        let current_shipping_label = '';
        for (var i in res.data.payments) {

          if (res.data.payments[i]['checked'] == true) {
            current_payment_method = res.data.payments[i]['value'];
            payment_method_label = res.data.payments[i]['label'];
          }
        }
        for (var k in res.data.shippings) {
          if (res.data.shippings[k]['checked'] == true) {
            current_shipping_method = res.data.shippings[k]['method'];
            current_shipping_label = res.data.shippings[k]['label'];
          }
        }
        that.setData({
          checkedGoodsList: res.data.cart_info.products,
          checkedAddress: default_address,
          couponCount: res.data.coupon.length, //优惠券列表
          couponPrice: res.data.cart_info.coupon_cost,
          goodsTotalPrice: res.data.cart_info.product_total, //商品合计
          orderTotalPrice: res.data.cart_info.grand_total, //订单总金额
          showOrderTotalPrice: res.data.cart_info.grand_total, //订单总金额
          payment_method: current_payment_method,
          shipping_method: current_shipping_method,
          payment_method_label: payment_method_label,
          current_shipping_label: current_shipping_label,
          billing: default_address,
          freightPrice: res.data.cart_info.shipping_cost,
          score_arr: res.data.score,
          taxTotal: res.data.cart_info.tax_total,
          crossBorderTax: res.data.cart_info.cross_border_tax,
          free_price: res.data.free_price,
        });
      }else{
        if (res.code == 400) { //超过限制
          wx.showModal({
            title: '温馨提示',
            showCancel: false,
            content: res.message,
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
          return;
        } else if (res.code == 1100003){
           util.myalert('对不起，你还没有登录');
           return;
        }else{
          util.myalert(res.message);
          return;
        }
      }
      wx.hideLoading();
    });
  },
  selectAddress() {
    wx.redirectTo({
      url: '/pages/shopping/address/address?couponId=' + this.data.couponId,
    })
  },
  selectCoupon() {
    if (this.data.couponCount > 0) {
      wx.redirectTo({
        url: '/pages/shopping/coupon/coupon?addressId=' + this.data.billing.address_id,
      })
    }
  },
  addAddress() {
    wx.redirectTo({
      url: '/pages/shopping/addressAdd/addressAdd',
    })
  },
  onReady: function() {
    // 页面渲染完成

  },
  onShow: function() {


  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭

  },
  submitOrder: function() {
    var that = this;
    if (that.data.billing.address_id == 0) {
      util.showErrorToast('请选择收货地址');
      return false;
    }
    if (that.data.buttonClicked) {
      return;
    }
    that.setData({
      buttonClicked: true
    })
    setTimeout(function() {
      that.setData({
        buttonClicked: false
      })
    }, 3000)
    util.request(api.OrderSubmit, {
      address_id: that.data.billing.address_id,
      couponId: that.data.couponId,
      score: that.data.score,
      shipping_method: that.data.shipping_method,
      payment_method: that.data.payment_method,
      billing: that.data.billing,
      product_id: that.data.product_id,
      qty: that.data.qty,
      custom_option: that.data.custom_option,
    }, 'POST').then(_res => {
      console.log('下单接口：');
      console.log(_res);
      if (_res.code === 200) {
        //获取支付参数
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
                    console.log(__res);
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
                wx.navigateTo({
                  url: '/pages/ucenter/order/order',
                })
                util.showErrorToast('支付失败');
              }
            })
          } else {
            util.showErrorToast('调起支付失败');
          }
        });

      } else {
        if (_res.code >= 10000){
          util.myalert(_res.message);
        }else{
           util.showErrorToast('下单失败');
        }
      }
    });
  },
  bindKeyInput(e) {
    //判断积分是否大于总积分
    var value = 0;
    var showOrderTotalPrice = this.data.orderTotalPrice;
    if (this.data.score_arr.total_score < e.detail.value) {
      wx.showToast({
        title: '积分不足',
      })
    } else {
      var value = Number(e.detail.value).toFixed(0);
      if (!(/^[1-9]\d*$/.test(e.detail.value)) || value <= 0) {
        wx.showToast({
          title: '请输入有效积分',
        })
        value = 0;
      } else {
        showOrderTotalPrice = showOrderTotalPrice - value;
        showOrderTotalPrice = showOrderTotalPrice > 0 ? showOrderTotalPrice : 0;
        console.log(showOrderTotalPrice);
        if (showOrderTotalPrice == 0) {
          value = Math.ceil(this.data.orderTotalPrice / this.data.score_arr.score_to_cash);
        }
      }
    }

    this.setData({
      score: value,
      showOrderTotalPrice: showOrderTotalPrice,
      score_discount: value * this.data.score_arr.score_to_cash
    })
  }
})