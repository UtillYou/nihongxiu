const ApiRootUrl = 'https://xwjxcxapi.dongluting.com/';
// const ApiRootUrl  = 'http://appserver.xcx.com/';
module.exports = {
  
  UploadImg: ApiRootUrl + 'customer/order/uploadimg', //上传图片接口
  IndexUrl: ApiRootUrl + 'cms/home/index', //首页数据接口
  CatalogList: ApiRootUrl + 'general/base/menu',  //分类目录全部分类数据接口
  CatalogCurrent: ApiRootUrl + 'catalog/current',  //分类目录当前分类数据接口

  AuthLoginByWeixin: ApiRootUrl + 'customer/login/account', //微信登录

  GoodsReview: ApiRootUrl + 'catalog/reviewproduct/submitreview',  //商品评论
  GoodsCount: ApiRootUrl + 'goods/count',  //统计商品总数
  GoodsSearchList: ApiRootUrl + 'catalogsearch/index/product',  //搜索商品列表
  GoodsList: ApiRootUrl + 'catalog/category/product',  //获得商品列表
  GoodsCategory: ApiRootUrl + 'cms/home/getmenubyid',  //获得分类数据
  GoodsDetail: ApiRootUrl + 'catalog/product/index',  //获得商品的详情
  GoodsNew: ApiRootUrl + 'goods/new',  //新品
  GoodsTop: ApiRootUrl + 'cms/home/topgoods',  //排行
  GoodsHot: ApiRootUrl + 'cms/home/hotgoods',  //热门
  GoodsRelated: ApiRootUrl + 'goods/related',  //商品详情页的关联商品（大家都在看）

  BrandList: ApiRootUrl + 'brand/list',  //品牌列表
  BrandDetail: ApiRootUrl + 'brand/detail',  //品牌详情

  CartList: ApiRootUrl + 'checkout/cart/index', //获取购物车的数据
  CartDelete:ApiRootUrl + 'checkout/cart/delmul',//删除所选商品
  CartAdd: ApiRootUrl + 'checkout/cart/add', // 添加商品到购物车
  CartUpdate: ApiRootUrl + 'checkout/cart/updateinfo', // 更新购物车的商品
  CartChecked: ApiRootUrl + 'checkout/cart/selectone', // 选择或取消选择商品
  CartCheckedAll: ApiRootUrl + 'checkout/cart/selectall', // 全部选择或取消选择商品
  CartGoodsCount: ApiRootUrl + 'cart/goodscount', // 获取购物车商品件数
  CartCheckout: ApiRootUrl + 'checkout/onepage/index', // 下单前信息确认

  GetLimitItem: ApiRootUrl + 'cms/home/limit-buy-ini', // 限时购初始话
  GetLimitItemInfo: ApiRootUrl + 'cms/home/getlimitbuybytime', // 限时购单个获取

  CouponList: ApiRootUrl + 'customer/coupon/list',  //优惠券列表
  CancelCoupon: ApiRootUrl + 'checkout/cart/cancelcoupon',  //支付时取消优惠券
  AddCoupon: ApiRootUrl + 'checkout/cart/addcoupon',  //支付时选择优惠券
  BuyItNow: ApiRootUrl + 'checkout/cart/buynow',  //buyitnow
  OrderSubmit: ApiRootUrl + 'checkout/onepage/submitorder', // 提交订单
  PayPrepayId: ApiRootUrl + 'pay/prepay', //获取微信统一下单prepay_id
  CancelOrder: ApiRootUrl + 'customer/order/cancelorder', //删除或取消订单
  WxPay: ApiRootUrl + 'payment/wxpay/start', //微信支付
  WxPaySuccess: ApiRootUrl + 'payment/success', //微信支付成功调用
  OrderStatistics: ApiRootUrl + 'customer/order/statistics', //订单统计
  CollectList: ApiRootUrl + 'customer/productfavorite/index',  //收藏列表
  CollectAddOrDelete: ApiRootUrl + 'catalog/product/favorite',  //添加或取消商品收藏

  CommentList: ApiRootUrl + 'catalog/reviewproduct/lists',  //评论列表
  CommentCount: ApiRootUrl + 'catalog/reviewproduct/lists',  //评论总数
  CommentPost: ApiRootUrl + 'comment/post',   //发表评论

  TopicList: ApiRootUrl + 'topic/list',  //专题列表
  TopicDetail: ApiRootUrl + 'cms/topic/detail',  //专题详情
  TopicRelated: ApiRootUrl + 'topic/related',  //相关专题

  SearchIndex: ApiRootUrl + 'catalogsearch/index/searchini',  //搜索页面数据
  SearchResult: ApiRootUrl + 'search/result',  //搜索数据
  SearchHelper: ApiRootUrl + 'search/helper',  //搜索帮助
  SearchClearHistory: ApiRootUrl + 'search/clearhistory',  //搜索帮助

  AddressList: ApiRootUrl + 'customer/address/index',  //收货地址列表
  AddressDetail: ApiRootUrl + 'customer/address/edit',  //收货地址详情和添加编辑一样
  AddressSave: ApiRootUrl + 'customer/address/save',  //保存收货地址
  AddressDelete: ApiRootUrl + 'customer/address/remove',  //删除收货地址

  RegionList: ApiRootUrl + 'region/list',  //获取区域列表

  BuyOrder: ApiRootUrl + 'customer/order/reorder',  //重新购买订单
  PayUnpaidOrder: ApiRootUrl + 'customer/order/gopay',  //支付待支付订单
  OrderList: ApiRootUrl + 'customer/order/index',  //订单列表
  OrderDetail: ApiRootUrl + 'customer/order/view',  //订单详情
  OrderCancel: ApiRootUrl + 'order/cancel',  //取消订单
  OrderExpress: ApiRootUrl + 'customer/order/logistics', //物流详情


  FeedBack: ApiRootUrl + 'cms/feedback/index', //反馈
  FeedBackIni: ApiRootUrl + 'cms/feedback/get-increment-id', //反馈初始化

  FootprintList: ApiRootUrl + 'footprint/list',  //足迹列表
  FootprintDelete: ApiRootUrl + 'footprint/delete',  //删除足迹

  GetPresaleGoods: ApiRootUrl + 'catalog/product/presale',  //预售商品
  DelCartGoods: ApiRootUrl + 'checkout/cart/deleteitem',  //删除购物车商品
  ClearCartGoods: ApiRootUrl + 'checkout/cart/clearcart',  //购物车商品全部清空含卡券

  ArticleDetail: ApiRootUrl + 'cms/home/articleinfo',  //文章详情

  MySkinInit: ApiRootUrl + 'customer/skin/init',  //肤质入口初始化
  SkinList: ApiRootUrl + 'customer/skin/list',  //肤质测试列表
  SkinSave: ApiRootUrl + 'customer/skin/save',  //肤质保存
  SkinAnserList: ApiRootUrl + 'customer/skin/answerlist',  //题目列表
  SkinGoods: ApiRootUrl + 'catalog/product/skingoods',  //根据肤质查询商品

  UploadImage: ApiRootUrl +'catalog/reviewproduct/upload-image',

  JoinGroup: ApiRootUrl + 'cms/home/joingroup',

  Essay: ApiRootUrl + 'cms/article/index',//fecshop的page文章调用
  Logistics: ApiRootUrl + 'customer/order/logistics',//物流信息调用
  CompletedOrder: ApiRootUrl + 'customer/order/completed-order',//确认订单收货
};