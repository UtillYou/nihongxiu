var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();

Page({
  data: {
    orderId: 0,
    expressName:'',
    express_sn: '',
    expressTraces: []
  },
  onLoad: function (options) {
    this.setData({
      orderId: options.id
    });
    this.getExpressInfo();
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示

  },
  getExpressInfo() {
    let that = this;
    util.request(api.OrderExpress, { increment_id: that.data.orderId },'GET').then(function (res) {
      console.log(res);
      if (res.code === 200) {
        that.setData({
          expressName: res.data.logistics.express_name,
          expressTraces: res.data.logistics.list,
          express_sn: res.data.logistics.express_sn,
        });
      }
    });
  },
  updateExpress() {
    this.getExpressInfo();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})