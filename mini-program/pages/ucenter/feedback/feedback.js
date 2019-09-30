var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();
Page({
  data: {
    array: ['请选择反馈类型', '商品相关', '物流状况', '客户服务', '优惠活动', '功能异常', '产品建议', '其他'],
    index: 0,
    content: '',
    telphone: '',
    email: '',
    num: 0,
    max: 500,
    isSubmit:false,
  },
  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value
    })
  },
  //字数限制  
  inputs: function(e) {
    // 获取输入框的内容
    var value = e.detail.value;
    // 获取输入框内容的长度
    var len = parseInt(value.length);
    //最多字数限制
    if (len > this.data.max) return;
    // 当输入框内容的长度大于最大长度限制（max)时，终止setData()的执行
    this.setData({
      content: value,
      num: len
    });
  },
  inputPhoneNum: function(e) {
    let phoneNumber = e.detail.value
    this.setData({
      telphone: phoneNumber
    });


    if (phoneNumber.length === 11) {
      let str = /^1\d{10}$/;
      if (str.test(phoneNumber)) {
        this.setData({
          telphone: phoneNumber
        });
      }
    }

  },
  onLoad: function() {},
  onReady: function() {

  },
  onShow: function() {

  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭
  },
  feedback: function() {
    var that = this;
    let index = that.data.index;
    let title = that.data.array[index];
    let content = that.data.content;
    let telphone = that.data.telphone;
    let pass = true;
    if (index == 0) {
      util.showErrorToast('请选择反馈类型');
      return;
    }
    if (content == '') {
      util.showErrorToast('请输入反馈内容');
      return;
    }
    if (telphone.length > 0) {
      let str = /^1\d{10}$/;
      if (!str.test(telphone)) {
        pass = false;
      }
    }
    if (!pass) {
      util.showErrorToast('手机号错误');
      return;
    }
    if (that.data.isSubmit == true){
       return;
    }
    that.setData({
      isSubmit: true
    });
    util.request(api.FeedBack, {
      type: 1,
      title: title,
      content: content,
      telphone: telphone,
    }, 'POST').then(function(res) {
      console.log(res);
      if (res.code == 200) {
        //重新初始化数据
        that.setData({
          index: 0,
          content: '',
          telphone: '',
          email: '',
          num: 0,
          max: 500,
        });
        util.showSuccessToast('感谢您的反馈');
      }else{
        util.showErrorToast(res.message);
      }
      that.setData({
        isSubmit: false
      });
    });
  }
})