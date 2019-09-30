var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
const app = getApp();
Page({
  data: {
    orderId: '',
    min: 5, //最少字数
    max: 100, //最多字数 (根据自己需求改变) 
    productsList: [],
  },
  returnIndexof: function(arr, value) {
    var _curIndex;
    var a = arr; //为了增加方法扩展适应性。我这稍微修改了下
    for (var i = 0; i < a.length; i++) {
      if (a[i].product_id == value) {
        _curIndex = i;
      }
    }
    return _curIndex;
  },
  // 星星点击事件
  starTap: function(e) {

    var that = this;
    var productId = e.currentTarget.dataset.productid; // 获取当前点击的是第几颗星星
    var star = e.currentTarget.dataset.index; // 获取当前点击的是第几颗星星
    console.log(star, productId);
    // 重新赋值就可以显示了
    var index = that.returnIndexof(that.data.productsList, productId);
    if (index === undefined) {
      that.data.productsList.push({
        star: star,
        id: productId
      });
    } else {
      that.data.productsList[index].star = star;
    }
    that.setData({
      productsList: that.data.productsList
    });
    console.log(that.data.productsList);
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
    var productId = e.currentTarget.dataset.productId;
    // 重新赋值就可以显示了
    var index = this.returnIndexof(this.data.productsList, productId);
    if (index !== undefined) {
      this.data.productsList[index].review_content = value;
      this.setData({
        productsList: this.data.productsList
      });
    }
  },
  //提交数据
  formSubmit: function(e) {

    var that =this;
    var productId = e.currentTarget.dataset.productId; //产品ID
    var productsList = this.data.productsList;
    console.log(productId);
    var index = this.returnIndexof(productsList, productId);
    console.log(index);
    var star = productsList[index].star == undefined ? 0 : productsList[index].star + 1; //星星数
    var review_content = productsList[index].review_content;  //内容
    var imgurls = productsList[index].imgurls;  //图片数组
    if (star == 0) {
      wx.showToast({
        title: '请选择评分',
      })
      return;
    }

    if (review_content == '' || review_content == undefined) {
      wx.showToast({
        title: '请输入内容',
      })
      return;
    }

    //评价
    util.request(api.GoodsReview, {
      order_id: that.data.orderId,
      product_id: productId,
      review_content: review_content,
      selectStar: star,
      images: imgurls
    },'POST').then(function (res) {
      console.log(res);
      if(res.code==200)
      {
        //设置这条记录已经评价
        productsList[index].is_reputation=1;
        that.setData({
          productsList: productsList
        });
        wx.showToast({
          title: '感谢您的评价'
        })
      }
    });

  },
  // 图片
  choose: function(e) { //这里是选取图片的方法
    var that = this;
    var productId = e.currentTarget.dataset.productId; //产品ID
    var productsList = that.data.productsList; //评价数组
    var index = this.returnIndexof(productsList, productId);
    var pics = productsList[index].pics == undefined ? [] : productsList[index].pics;
    if (productsList[index].is_reputation==1) {
      return;
    }
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
        that.uploadimg(imgsrc[0], productId, imgId); //返回图片地址,有大小之分
        var newData = {
          'id': imgId,
          'imgsrc': imgsrc[0]
        };
        //赋值
        productsList[index].pics = pics.concat(newData);

        that.setData({
          productsList: productsList,
        });
        console.log(that.data.productsList);
      },
      fail: function() {},
      complete: function() {}
    })
  },
  uploadimg: function(imgsrc, productId, imgid) { //这里触发图片上传的方法
    var that = this;
    var imgs = that.data.imgs;
    console.log(imgsrc);
    wx.uploadFile({
      url: api.UploadImg,
      filePath: imgsrc,
      formData: {
        'imgid': imgid,
        'product_id': productId
      },
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
        console.log(res);
        if (res.code == 200) {
          var productsList = that.data.productsList;
          var index = that.returnIndexof(productsList, productId);
          var imgurls = productsList[index].imgurls == undefined ? [] : productsList[index].imgurls; //存的后端返回的url数组   
          var newData = {
            'id': imgid,
            'imgsrc': res.data.saveurl //返回的服务器图片地址
          };
          productsList[index].imgurls = imgurls.concat(newData);
          that.setData({
            productsList: productsList,
          });
        }
      }
    })
  },
  onLoad: function(options) {
    var that = this;
    if (options.id) {
      that.setData({
        orderId: options.id,
      });
      util.request(api.OrderDetail, {
        order_id: options.id,
      }).then(function(res) {
        console.log(res);
        if (res.code === 200) {
          that.setData({
            productsList: res.data.order.products,
          });
        }
      });
    }
  },
  // 删除图片
  deleteImg: function(e) {
    var productId = e.currentTarget.dataset.productId; //产品ID
    var imgid = e.currentTarget.dataset.imgid; //删除的图片id
    var productsList = this.data.productsList; //评价数组
    var index = this.returnIndexof(productsList, productId);
    var pics = productsList[index].pics == undefined ? [] : productsList[index].pics;
    for (var i in pics) {
      if (pics[i].id == imgid) {
        pics.splice(i, 1);
        break;
      }
    }
    var imgurls = productsList[index].imgurls == undefined ? [] : productsList[index].imgurls; //存的后端返回的url数组
    for (var i in imgurls) {
      if (imgurls[i].id == imgid) {
        imgurls.splice(i, 1);
        break;
      }
    }
    this.setData({
      productsList: productsList,
    });
  },
  // 预览图片
  previewImg: function(e) {
    var productId = e.currentTarget.dataset.productId; //产品ID
    var imgid = e.currentTarget.dataset.imgid; //预览的图片id
    var productsList = this.data.productsList; //评价数组
    var index = this.returnIndexof(productsList, productId);
    var pics = productsList[index].pics == undefined ? [] : productsList[index].pics;
    var imgArr = [];
    for (var i in pics) {
      imgArr[i] = pics[i].imgsrc;
      if (pics[i].id == imgid) {
        var current = pics[i].imgsrc;
      }
    }
    wx.previewImage({
      current: current,
      urls: imgArr
    })
  }
})