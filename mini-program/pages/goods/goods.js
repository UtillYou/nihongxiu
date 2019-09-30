var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
const timer = require('../../utils/wxTimer.js')

Page({
  data: {
    is_use:1,
    id: 0,
    goods: {},
    gallery: [],
    attribute: [],
    issueList: [],
    comment: [],
    brand: {},
    specificationList: [],
    productList: [],
    relatedGoods: [],
    cartGoodsCount: 0,
    userHasCollect: 0,
    number: 1,
    is_favorite: 0,
    checkedSpecText: '请选择规格数量',
    openAttr: false,
    goods_name: '',
    noCollectImage: "/static/images/icon_collect.png",
    hasCollectImage: "/static/images/icon_collect_checked.png",
    collectBackImage: "/static/images/icon_collect.png",
    checkedGoods: {
      'checkedImg': '',
      'checkedPrice': 0,
    }, //选择的属性
    commodityAttr: [ //商品属性
      // {
      //   price: 35.0,
      //   "qty": 8,
      //   "attrValueList": [
      //     {
      //       "attrKey": "规格：",
      //       "attrValue": "+免费配料",
      //       "attrCode": "1001"
      //     },
      //   ]
      // },
      // ]

    ],
    attrValueList: [],
    showLoginDialog: false,
    wxTimerList:{},
    is_special:false,
    show_price:'',
    is_only_buynow:false,
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
    }).catch((err) => {
      console.log(err)
    })
  },
  onCloseLoginDialog() {
    this.setData({
      showLoginDialog: false
    })
  },
  getGoodsInfo: function() {
    let that = this;
    util.request(api.GoodsDetail, {
      product_id: that.data.id
    }).then(function(res) {
      // console.log(res);
      if (res.code === 200) {
        var collectBackImage = that.data.noCollectImage;
        if (res.data.is_favorite == 1) {
          collectBackImage = that.data.hasCollectImage;
        }
        var checkedGoods = {
          'checkedImg': res.data.thumbnail_img[0],
          'checkedPrice': res.data.price_info.special_price && res.data.price_info.special_price.value> 0 ? res.data.price_info.special_price.value : res.data.price_info.price.value,
        }
        //是否是特价商品,是的话开启定时
        var special_price = res.data.price_info.special_price && res.data.price_info.special_price.value > 0 ? res.data.price_info.special_price.value:0;
        var show_price = special_price > 0 ? special_price : res.data.price_info.price.value;

        var is_special  = false;
        var discount    =  0 ;
        if (special_price > 0 && res.data.special_to>0 && res.data.special_from>0)
        {
          var discount = (res.data.price_info.special_price.value * 10 / res.data.price_info.price.value).toFixed(1); 
          // console.log(discount);
          var now = Date.parse(new Date()) / 1000;  
          var total_seconds = res.data.special_to - now ;
          if (total_seconds > 2)
          {
            is_special = true;
            var wxTimer3 = new timer({
              total_seconds: total_seconds,
              name: 'wxTimer3',
              complete: function () {
                console.log("完成了")
              }
            })
            wxTimer3.start(that);
          }
        }
        that.setData({
          goods: res.data,
          goods_name: res.data.name,
          gallery: res.data.image_detail,
          attribute: res.data.groupAttrArr,
          commodityAttr: res.data.custom_option,
          includeGroup: res.data.custom_option,
          checkedGoods: checkedGoods,
          cartGoodsCount: res.data.items_count,
          is_special: is_special,
          discount: discount,
          comment: res.data.productReview,
          relatedGoods: res.data.buy_also_buy,
          is_favorite: res.data.is_favorite,
          collectBackImage: collectBackImage,
          show_price: show_price,
          is_only_buynow: res.data.is_only_buynow,
        });



        that.distachAttrValue(that.data.commodityAttr);
        // 只有一个属性组合的时候默认选中 
        // console.log(this.data.attrValueList); 
        if (that.data.commodityAttr.length == 1) {
          for (var i = 0; i < that.data.commodityAttr[0].attrValueList.length; i++) {
            that.data.attrValueList[i].selectedValue = that.data.commodityAttr[0].attrValueList[i].attrValue;
          }
          var checkedGoods = {
            'checkedImg': that.data.commodityAttr[0].image,
            'checkedPrice': Number(that.data.commodityAttr[0].price) + Number(show_price),
          }
          that.setData({
            attrValueList: that.data.attrValueList,
            checkedGoods: checkedGoods
          });
        }
        WxParse.wxParse('goodsDetail', 'html', res.data.description, that);
      } else {
        // wx.navigateBack({
        //   delta: 1
        // })
        if (res.code == 1300001){
          that.setData({
            is_use: 0
          });
        }else{
          util.myalert(res.message);
        }
      }
    });
  },
  downNotice:function(){
    util.myalert('商品不存在或已经下架');
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      id: options.id
    });
    this.getGoodsInfo();
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {},
  buyItNow: function() {
    var that = this;
    if(that.data.is_use == 0){
      that.downNotice();
      return;
    }
    //未登录跳转
    if (!wx.getStorageSync('access_token')) {
      that.setData({
        showLoginDialog: true
      });
      return;
    }

    //判断是否是展开的
    if (!this.data.openAttr) {
      this.setData({
        openAttr: !this.data.openAttr
      });
      return;
    }

    var value = [];
    for (var i = 0; i < this.data.attrValueList.length; i++) {
      if (!this.data.attrValueList[i].selectedValue) {
        break;
      }
      value[this.data.attrValueList[i].attrKey] = this.getAttrCode(this.data.attrValueList[i].attrKey, this.data.attrValueList[i].selectedValue);
    }

    if (i < this.data.attrValueList.length) {
      wx.showToast({
        title: '请选择完整规格！',
        icon: 'loading',
        duration: 1000
      })
    } else {
      var custom_option = '';
      if (this.data.attrValueList.length > 0) {
        custom_option += '{';
        for (var i in value) {
          custom_option += '"' + i + '":"' + value[i] + '",';
        }
        custom_option = custom_option.substr(0, custom_option.length - 1);
        custom_option += '}';
      }

      util.request(api.BuyItNow, {
          product_id: that.data.goods._id,
          qty: that.data.number,
          custom_option: custom_option,
        }, "POST")
        .then(function(res) {
          // console.log(res);
          if (res.code == 200) {
            //调用下单初始话
            wx.navigateTo({
              url: '../shopping/checkout/checkout?product_id=' + that.data.goods._id + '&qty=' + that.data.number + '&custom_option=' + custom_option,
            })
          } else {
            util.myalert(res.message);
           
          }
        });
    }
  },
  toBuyItNow:function(){
    var that = this;
    if (that.data.is_use == 0) {
      that.downNotice();
      return;
    }
    //未登录跳转
    if (!wx.getStorageSync('access_token')) {
      that.setData({
        showLoginDialog: true
      });
      return;
    }

    //判断是否是展开的
    if (!this.data.openAttr) {
      this.setData({
        openAttr: !this.data.openAttr
      });
      return;
    }

    var value = [];
    for (var i = 0; i < this.data.attrValueList.length; i++) {
      if (!this.data.attrValueList[i].selectedValue) {
        break;
      }
      value[this.data.attrValueList[i].attrKey] = this.getAttrCode(this.data.attrValueList[i].attrKey, this.data.attrValueList[i].selectedValue);
    }

    if (i < this.data.attrValueList.length) {
      wx.showToast({
        title: '请选择完整规格！',
        icon: 'loading',
        duration: 1000
      })
    } else {
      var custom_option = '';
      if (this.data.attrValueList.length > 0) {
        custom_option += '{';
        for (var i in value) {
          custom_option += '"' + i + '":"' + value[i] + '",';
        }
        custom_option = custom_option.substr(0, custom_option.length - 1);
        custom_option += '}';
      }
      wx.navigateTo({
        url: '../shopping/checkout/checkout?product_id=' + that.data.goods._id + '&qty=' + that.data.number + '&custom_option=' + custom_option,
      })
       
    }  
  },
  getAttrCode: function(key, value) {
    var commodityAttr = this.data.commodityAttr;
    for (var i in commodityAttr) {
      var attrValueList = commodityAttr[i].attrValueList;
      for (var j in attrValueList) {

        if (attrValueList[j].attrKey == key && attrValueList[j].attrValue == value) {
          return attrValueList[j].attrCode;
          break;
        }
      }
    }
    return false;
  },
  addToCart: function() {
    var that = this;
    if(that.data.is_only_buynow == true){
        util.myalert('对不起,该商品仅支持立即购买');
        return;
    }
    if (that.data.is_use == 0) {
      that.downNotice();
      return;
    }
    if (!wx.getStorageSync('access_token')) {
      that.setData({
        showLoginDialog: true
      });
      return;
    }
    //判断是否是展开的
    if (!this.data.openAttr) {
      this.setData({
        openAttr: !this.data.openAttr
      });
      return;
    }
    var value = [];
    for (var i = 0; i < this.data.attrValueList.length; i++) {
      if (!this.data.attrValueList[i].selectedValue) {
        break;
      }
      //根据有key和value获取code
      value[this.data.attrValueList[i].attrKey] = this.getAttrCode(this.data.attrValueList[i].attrKey, this.data.attrValueList[i].selectedValue);
    }
    if (i < this.data.attrValueList.length) {
      wx.showToast({
        title: '请选择完整规格！',
        icon: 'loading',
        duration: 1000
      })
    } else {
      var custom_option = '';
      if (this.data.attrValueList.length > 0) {
        custom_option += '{';
        for (var i in value) {
          custom_option += '"' + i + '":"' + value[i] + '",';
        }
        custom_option = custom_option.substr(0, custom_option.length - 1);
        custom_option += '}';
      }
      //添加到购物车
      util.request(api.CartAdd, {
          product_id: that.data.goods._id,
          qty: that.data.number,
          custom_option: custom_option,
        }, "POST")
        .then(function(res) {
          // console.log(res);
          if (res.code == 200) {
            wx.showToast({
              title: '添加成功'
            });
            that.setData({
              openAttr: !that.data.openAttr,
              cartGoodsCount: res.data.items_count
            });
            app.globalData.cartTimer = 172800;
          } else {

            util.myalert(res.message);
           
          }

        });

    }
  },
  /* 获取数据 */
  distachAttrValue: function(commodityAttr) {
    // 把数据对象的数据（视图使用），写到局部内 
    var attrValueList = this.data.attrValueList;
    // 遍历获取的数据 
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        var attrIndex = this.getAttrIndex(commodityAttr[i].attrValueList[j].attrKey, attrValueList);
        // console.log('属性索引', attrIndex); 
        // 如果还没有属性索引为-1，此时新增属性并设置属性值数组的第一个值；索引大于等于0，表示已存在的属性名的位置 
        if (attrIndex >= 0) {
          // 如果属性值数组中没有该值，push新值；否则不处理 
          if (!this.isValueExist(commodityAttr[i].attrValueList[j].attrValue, attrValueList[attrIndex].attrValues)) {
            attrValueList[attrIndex].attrValues.push(commodityAttr[i].attrValueList[j].attrValue);
          }
          if (!this.isValueExist(commodityAttr[i].attrValueList[j].attrCode, attrValueList[attrIndex].attrCode)) {
            attrValueList[attrIndex].attrCode.push(commodityAttr[i].attrValueList[j].attrCode);
          }
        } else {
          attrValueList.push({
            attrKey: commodityAttr[i].attrValueList[j].attrKey,
            attrCode: [commodityAttr[i].attrValueList[j].attrCode],
            attrLabel: [commodityAttr[i].attrValueList[j].attrLabel],
            attrValues: [commodityAttr[i].attrValueList[j].attrValue]
          });
        }
      }
    }
    // console.log('result', attrValueList)
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].attrValueStatus) {
          attrValueList[i].attrValueStatus[j] = true;
        } else {
          attrValueList[i].attrValueStatus = [];
          attrValueList[i].attrValueStatus[j] = true;
        }
      }
    }
    this.setData({
      attrValueList: attrValueList
    });
  },
  getAttrIndex: function(attrName, attrValueList) {
    // 判断数组中的attrKey是否有该属性值 
    for (var i = 0; i < attrValueList.length; i++) {
      if (attrName == attrValueList[i].attrKey) {
        break;
      }
    }
    return i < attrValueList.length ? i : -1;
  },
  isValueExist: function(value, valueArr) {
    // 判断是否已有属性值 
    for (var i = 0; i < valueArr.length; i++) {
      if (valueArr[i] == value) {
        break;
      }
    }
    return i < valueArr.length;
  },
  /* 选择属性值事件 */
  selectAttrValue: function(e) {
    var attrValueList = this.data.attrValueList;
    var index = e.currentTarget.dataset.index; //属性索引 
    var key = e.currentTarget.dataset.key;
    var value = e.currentTarget.dataset.value;

    if (e.currentTarget.dataset.status || index == this.data.firstIndex) {
      if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
        // 取消选中 
        this.disSelectValue(attrValueList, index, key, value);
      } else {
        // 选中 
        this.selectValue(attrValueList, index, key, value);
      }

    }
  },
  /* 选中 */
  selectValue: function(attrValueList, index, key, value, unselectStatus) {
    
    var includeGroup = [];
    var commodityAttr = this.data.commodityAttr;
    if (index == this.data.firstIndex && !unselectStatus) { // 如果是第一个选中的属性值，则该属性所有值可选 
      // 其他选中的属性值全都置空 
      // console.log('其他选中的属性值全都置空', index, this.data.firstIndex, !unselectStatus); 
      for (var i = 0; i < attrValueList.length; i++) {
        for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
          attrValueList[i].selectedValue = '';
        }
      }
    } else {
      var commodityAttr = this.data.includeGroup;
    }

    // console.log('选中', commodityAttr, index, key, value); 
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        if (commodityAttr[i].attrValueList[j].attrKey == key && commodityAttr[i].attrValueList[j].attrValue == value) {
          includeGroup.push(commodityAttr[i]);
        }
      }
    }
    attrValueList[index].selectedValue = value;

    // 判断属性是否可选 
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = false;
      }
    }
    for (var k = 0; k < attrValueList.length; k++) {
      for (var i = 0; i < includeGroup.length; i++) {
        for (var j = 0; j < includeGroup[i].attrValueList.length; j++) {
          if (attrValueList[k].attrKey == includeGroup[i].attrValueList[j].attrKey) {
            for (var m = 0; m < attrValueList[k].attrValues.length; m++) {
              if (attrValueList[k].attrValues[m] == includeGroup[i].attrValueList[j].attrValue) {
                attrValueList[k].attrValueStatus[m] = true;
              }
            }
          }
        }
      }
    }

    this.setData({
      attrValueList: attrValueList,
      includeGroup: includeGroup
    });

    var selectCode =[];
    for (var i in attrValueList)
    {
      var attrValueStatus = attrValueList[i].attrValueStatus;
      for (var j in attrValueStatus)
      { 
        if (attrValueStatus[j]==true)
        {
          selectCode.push(attrValueList[i].attrCode[j]);
        }
      }
    }
    var sku = selectCode.join('-');
    //查找对应sku的价格图片
    for (var i in commodityAttr)
    {
      if (commodityAttr[i].asu==sku)
      {
        var checkedGoods = {
          'checkedImg': commodityAttr[i].image,
          'checkedPrice': Number(commodityAttr[i].price) + Number(this.data.show_price),
        }
        this.setData({
          checkedGoods: checkedGoods
        });
        break;
      }
    }

    var count = 0;
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].selectedValue) {
          count++;
          break;
        }
      }
    }
    if (count < 2) { // 第一次选中，同属性的值都可选 
      this.setData({
        firstIndex: index
      });
    } else {
      this.setData({
        firstIndex: -1
      });
    }
  },
  /* 取消选中 */
  disSelectValue: function(attrValueList, index, key, value) {
    var commodityAttr = this.data.commodityAttr;
    attrValueList[index].selectedValue = '';

    // 判断属性是否可选 
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = true;
      }
    }
    this.setData({
      includeGroup: commodityAttr,
      attrValueList: attrValueList
    });

    for (var i = 0; i < attrValueList.length; i++) {
      if (attrValueList[i].selectedValue) {
        this.selectValue(attrValueList, i, attrValueList[i].attrKey, attrValueList[i].selectedValue, true);
      }
    }
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭

  },
  switchAttrPop: function() {
    if (this.data.openAttr == false) {
      this.setData({
        openAttr: !this.data.openAttr
      });
    }
  },
  closeAttr: function() {
    this.setData({
      openAttr: false,
    });
  },
  addCannelCollect: function() {
    let that = this;
    if (that.data.is_use == 0) {
      that.downNotice();
      return;
    }
    if (!wx.getStorageSync('access_token')) {
      that.setData({
        showLoginDialog: true
      });
      return;
    }
    //添加或是取消收藏
    util.request(api.CollectAddOrDelete, {
        product_id: that.data.id
      })
      .then(function(res) {
        // console.log(res);
        if (res.code == 200) {
          if (that.data.is_favorite == 0) {
            that.setData({
              'collectBackImage': that.data.hasCollectImage,
              'is_favorite': 1
            });
            wx.showToast({
              'title': '已放入心愿单',
            })
          } else {
            that.setData({
              'collectBackImage': that.data.noCollectImage,
              'is_favorite': 0
            });
            wx.showToast({
              'title': '已取消',
            })
          }

        } else {
          wx.showToast({
            image: '/static/images/icon_error.png',
            title: res.errmsg,
            mask: true
          });
        }
      });
  },
  openCartPage: function() {
    wx.switchTab({
      url: '/pages/cart/cart',
    });
  },
  cutNumber: function() {
    this.setData({
      number: (this.data.number - 1 > 1) ? this.data.number - 1 : 1
    });
  },
  addNumber: function() {
    this.setData({
      number: this.data.number + 1,
    });
  },
  onDialogBody: function () {

  }
})