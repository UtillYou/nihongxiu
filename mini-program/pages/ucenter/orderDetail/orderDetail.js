var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

Page({
  data: {
    orderId: 0,
    orderInfo: {},
    orderGoods: [],
    handleOption: {},
    // incrementId:''
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      orderId: options.id
    });
    this.getOrderDetail();
  },
  getOrderDetail() {
    let that = this;
    console.log(that.data.orderId);
    util.request(api.OrderDetail, {
      order_id: that.data.orderId
    }).then(function (res) {
      console.log(res);
      if (res.code === 200) {
        console.log(res.data);
        that.setData({
          orderInfo: res.data.order,
          orderGoods: res.data.order.products,
          // incrementId: res.data.order.increment_id,
          // handleOption: res.data.handleOption
        });
        //that.payTimer();
      }
    });
  },
  payTimer() {
    let that = this;
    let orderInfo = that.data.orderInfo;

    setInterval(() => {
      console.log(orderInfo);
      orderInfo.add_time -= 1;
      that.setData({
        orderInfo: orderInfo,
      });
    }, 1000);
  },
  cancelOrder(event){
    wx.showModal({
      title: '',
      content: '确定要取消订单吗？',
      success: function (res) {
        if (res.confirm) {
          console.log(event.currentTarget.dataset.orderId);
          util.request(api.CancelOrder, {
            order_id: event.currentTarget.dataset.orderId
          },'POST').then(function (res) {
            console.log(res);
            if (res.code === 200) {
              //返回订单列表
              wx.navigateTo({
                url:'/pages/ucenter/order/order'
              })
            }
          });
        }
      }
    })
    return false;
  },
  payOrder() {
    let that = this;
    util.request(api.PayPrepayId, {
      orderId: that.data.orderId 
    }).then(function (res) {
      if (res.errno === 0) {
        const payParam = res.data;
        wx.requestPayment({
          'timeStamp': payParam.timeStamp,
          'nonceStr': payParam.nonceStr,
          'package': payParam.package,
          'signType': payParam.signType,
          'paySign': payParam.paySign,
          'success': function (res) {
            console.log(res)
          },
          'fail': function (res) {
            console.log(res)
          }
        });
      }
    });

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
  }
})