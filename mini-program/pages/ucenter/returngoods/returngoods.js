var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();
Page({
  data: {
    index: 0,
    content: '',
    num: 0,
    max: 500,
    increment_id:'',
    pics: [],
    images:[],
    showLoginDialog:false,
    incrementIndex:0,
    incrementArray:[],
    questionIndex:0,
    question:[],
  },

  onLoad: function() {
    var that = this;
    if (wx.getStorageSync('access_token')) {

    } else {
      that.setData({
        showLoginDialog: true,
      });
      return;
    }
    
    that.onFeedIni();
  
  },
  onFeedIni:function(e){
    var that = this;

    util.request(api.FeedBackIni
    ).then(function (res) {
      console.log(res);
      if (res.code == 200) {
        that.setData({
          incrementArray: res.data.increment,
          question: res.data.question,
        });
      } else {
        if (res.code == 404) {
          util.myalert('请求错误,请联系管理员');
          return;
        }
        if (res.code != 10000) {
          util.myalert(res.message);
        }
        if (res.code == 10000){
          that.setData({
            showLoginDialog:true
          })
        }
      }
    });

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
      this.onFeedIni();
    }).catch((err) => {
      console.log(err)
    })
  },

  onReady: function() {

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
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭
  },
  bindinputOrder(event) {
    this.setData({
      increment_id: event.detail.value,
    });
  },
  submit: function() {
    let that = this;
    let increment_id = that.data.incrementArray[that.data.incrementIndex];
    let content = that.data.question[that.data.questionIndex];
    if (increment_id =='请选择订单号')
    {
      util.showErrorToast('请选择订单号');
      return;
    }
    if (content == ''){
      util.showErrorToast('请选择问题');
      return;
    }
    if (that.data.images.length == 0) {
      util.showErrorToast('请上传图片');
      return;
    }
    util.request(api.FeedBack, {
      type: 2,
      content: content,
      increment_id: increment_id,
      images: that.data.images,
    }, 'POST').then(function(res) {
      console.log(res);
      if (res.code == 200) {
        wx.showToast({
          title: '提交成功'
        })
      }
    });
  },

  // 图片
  choose: function(e) { //这里是选取图片的方法
    var that = this;
    var pics = that.data.pics;
    if (pics.length == 5) {
      wx.showToast({
        title: '最多上传5张哦',
      })
      return;
    }
    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数，默认9
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function(res) {
        var imgsrc = res.tempFilePaths;
        var imgId = Date.parse(new Date());
        that.uploadimg(imgsrc[0], imgId); //返回图片地址,有大小之分
        var newData = {
          'id': imgId,
          'imgsrc': imgsrc[0]
        };
        //赋值
        pics = pics.concat(newData);
        that.setData({
          pics: pics,
        });
      },
      fail: function() {},
      complete: function() {}
    })
  },
  uploadimg: function(imgsrc, imgid) { //这里触发图片上传的方法
    var that = this;
    wx.uploadFile({
      url: api.UploadImg,
      filePath: imgsrc,
      formData: {},
      header: {
        'Content-Type': 'application/json',
        'access-token': wx.getStorageSync('access_token'),
        'fecshop-uuid': wx.getStorageSync('uuid'),
        'fecshop-currency': wx.getStorageSync('currency'),
        'fecshop-lang': wx.getStorageSync('lang'),
      },
      name: 'file',
      success: function(_res) {
        //打印
        let res = JSON.parse(_res.data);
        console.log('图片上传');
        console.log(res);
        if (res.code == 200) {
          var newData = {
            'id': imgid,
            'imgsrc': res.data.saveurl //返回的服务器图片地址
          };
          that.setData({
            images: that.data.images.concat(newData),
          });
          console.log(that.data.images);
        }
      }
    })
  },
  // 删除图片
  deleteImg: function (e) {
    var imgid = e.currentTarget.dataset.imgid; //删除的图片id
    var pics = this.data.pics; 
    var images = this.data.images; 
    for (var i in pics) {
      if (pics[i].id == imgid) {
        pics.splice(i, 1);
        break;
      }
    }
    for (var i in images) {
      if (images[i].id == imgid) {
        images.splice(i, 1);
        break;
      }
    }
    this.setData({
      pics: pics,
      images: images,
    });
  },

  bindIncrementIdChange: function (e) {
    this.setData({
      incrementIndex: e.detail.value
    })
  },

  bindQuestionChange: function (e) {
    this.setData({
      questionIndex: e.detail.value
    })
  },
  onDialogBody: function () {

  }
})