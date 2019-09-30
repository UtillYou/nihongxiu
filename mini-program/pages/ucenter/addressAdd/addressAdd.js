var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();
Page({
  data: {
    address: {
      id: 0,
      state: '北京市',
      city: '北京市',
      district: '东城区',
      street1: '', //街道地址
      full_region: '', //全地址
      first_name: '', //用户姓名
      telephone: '', //用户电话
      id_card:'',
      is_default: 2, //1是默认 2不是
    },
    region: ['北京市', '北京市', '东城区'], //省市区
    addressId: 0, //地址ID
    pics: [],
  },
  bindRegionChange: function(e) {
    console.log('picker发送选择改变,携带值为', e.detail.value);
    this.setData({
      region: e.detail.value,
      ['address.state']: e.detail.value[0],
      ['address.city']: e.detail.value[1],
      ['address.district']: e.detail.value[2]
    })
  },
  bindinputMobile(event) {
    let address = this.data.address;
    address.telephone = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindinputName(event) {
    let address = this.data.address;
    address.first_name = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindinputIdCard(event) {
    let address = this.data.address;
    address.id_card = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindinputAddress(event) {
    let address = this.data.address;
    address.street1 = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindIsDefault(e) {
    let address = this.data.address;
    address.is_default = e.target.dataset.avalue == 1 ? 2 : 1;
    this.setData({
      address: address
    });
  },
  getAddressDetail() {
    let that = this;
    util.request(api.AddressDetail, {
      address_id: that.data.addressId
    }).then(function(res) {
      console.log(res);
      if (res.code === 200) {
        var pics = res.data.address.pics ;
        that.setData({
          address: res.data.address,
          pics : pics
        });
      }
    });
  },

  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    console.log(options)
    if (options.id && options.id != 0) {
      this.setData({
        addressId: options.id
      });
      this.getAddressDetail();
    }
    // this.getRegionList(1);

  },
  onReady: function() {

  },
  cancelAddress() {
    wx.navigateTo({
      url: '/pages/ucenter/address/address',
    })
  },
  saveAddress() {
    let address = this.data.address;
    if (address.first_name == '') {
      util.showErrorToast('请输入真实姓名');
      return false;
    }

    if (address.telephone == '') {
      util.showErrorToast('请输入手机号码');
      return false;
    }else{
      var preg = /^1[1-9]\d{9}$/;
      if (!preg.test(address.telephone)) {
        util.showErrorToast('手机号码错误');
        return false;
      }
    }

    if (address.id_card == '') {
      util.showErrorToast('请输入身份证');
      return false;
    }else{
      var preg = /^\d{17}([0-9]|X|x)$/;
      if (!preg.test(address.id_card)){
        util.showErrorToast('身份证错误');
        return false;
      }
    }


    if (address.street1 == '') {
      util.showErrorToast('请输入详细地址');
      return false;
    }

    let that = this;
    util.request(api.AddressSave, {
      address_id: that.data.addressId,
      first_name: address.first_name,
      telephone: address.telephone,
      id_card:address.id_card,
      state: address.state,
      city: address.city,
      district: address.district,
      country: address.country,
      street: address.street1,
      isDefaultActive: address.is_default,
      pics : that.data.pics,
    }, 'POST').then(function(res) {
      console.log(res);
      if (res.code === 200) {
        wx.navigateTo({
          url: '/pages/ucenter/address/address',
        })
      }
    });

  },
  onShow: function() {
    // 页面显示

  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭

  },
  readFromWx: function () {
    const that = this
    wx.chooseAddress({
      success: function (res) {
        console.log(res);
        that.setData({
          ['address.state']: res.provinceName,
          ['address.city']: res.cityName,
          ['address.district']: res.countyName,
          ['address.first_name']: res.userName,
          ['address.telephone']: res.telNumber,
          ['address.street1']: res.detailInfo,
        });
      }
    })
  },
  // 图片
  choose: function (e) { //这里是选取图片的方法
    var that = this;
    var pics = that.data.pics;
    if(pics.length >= 2){
      return ;
    }
    wx.chooseImage({
      count: 1 , // 最多可以选择的图片张数，默认9
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        var imgsrc = res.tempFilePaths;
        var imgid = Date.parse(new Date());
        that.uploadimg(imgsrc[0], imgid); //返回图片地址,有大小之分
      },
      fail: function () { },
      complete: function () { }
    })
  },
  uploadimg: function (imgsrc, imgid) { //这里触发图片上传的方法
    var that = this;
    var imgs = that.data.imgs;
    wx.uploadFile({
      url: api.UploadImg,
      filePath: imgsrc,
      formData: {
        'type'  :'address'
      },
      header: {
        'Content-Type': 'application/json',
        'access-token': wx.getStorageSync('access_token'),
        'fecshop-uuid': wx.getStorageSync('uuid'),
        'fecshop-currency': wx.getStorageSync('currency'),
        'fecshop-lang': wx.getStorageSync('lang'),
      },
      name: 'file',
      success: function (_res) {
        const res = JSON.parse(_res.data) ;
        console.log(res);
        if (res.code == 200 ) {
          var pics  =that.data.pics;
          pics.push(res.data.url);
          var newData = {
            'imgsrc': res.data.url //返回的服务器图片地址
          };
          that.setData({
            pics: pics
          });
          console.log(that.data.pics);
        }
      }
    })
  },
  // 删除图片
  deleteImg: function (e) {
    var pics = this.data.pics;
    var index = e.currentTarget.dataset.index; //删除的图片id
    for (var i in pics) {
      if (i == index) {
        pics.splice(i, 1);
        break;
      }
    }
    this.setData({
      pics: pics,
    });
  },

})