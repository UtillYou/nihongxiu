var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();
Page({
  data: {
    address: {
      address_id: 0,
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
    address_id: 0, //地址ID
    
  },
  bindRegionChange: function(e) {
    console.log('picker发送选择改变,携带值为', e.detail.value);
    this.setData({
      region: e.detail.value,
      ['address.state']:e.detail.value[0],
      ['address.city']:e.detail.value[1],
      ['address.district']:e.detail.value[2]
    })
  },
  bindinputMobile(event) {
    let address = this.data.address;
    address.telephone = event.detail.value;
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
  bindinputName(event) {
    let address = this.data.address;
    address.first_name = event.detail.value;
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
    console.log(e);
    let address = this.data.address;
    address.is_default = e.target.dataset.avalue == 1 ? 2 : 1;
    this.setData({
      address: address
    });
  },
  getAddressDetail() {
    let that = this;
    util.request(api.AddressDetail, {
      address_id: that.data.address_id
    }).then(function(res) {
      console.log(res);
      if (res.code === 200) {
        that.setData({
          address: res.data.address
        });
      }
    });
  },
  
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    if (options.id && options.id != 0 && options.id != '') {
      this.setData({
        address_id: options.id
      });
      this.getAddressDetail();
    }
  },
  onReady: function() {
  },
  
  cancelAddress() {
    wx.navigateTo({
      url: '/pages/shopping/address/address',
    })
  },
  saveAddress() {
    let address = this.data.address;
    console.log(this.data.address);
    if (address.first_name == '') {
      util.showErrorToast('请输入姓名');
      return false;
    }

    if (address.telephone == '') {
      util.showErrorToast('请输入手机号码');
      return false;
    }
    if (address.id_card == '') {
      util.showErrorToast('请输入身份证');
      return false;
    }
    if (address.street1 == '') {
      util.showErrorToast('请输入详细地址');
      return false;
    }

    let that = this;
    util.request(api.AddressSave, {
      address_id: that.data.address_id,
      first_name: address.first_name,
      telephone: address.telephone,
      id_card:address.id_card,
      state: address.state,
      city:address.city,
      district:address.district,
      country: address.country,
      street: address.street1,
      isDefaultActive: address.is_default,
    }, 'POST').then(function(res) {
      console.log(res);
      if (res.code === 200) {
        wx.navigateTo({
          url: '/pages/shopping/address/address',
        })
      }else{
        wx.showToast({
          title: res.message,
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
  }
})