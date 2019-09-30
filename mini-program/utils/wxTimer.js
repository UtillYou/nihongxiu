var wxTimer = function(initObj) {
  initObj = initObj || {};
  // this.beginTime = initObj.beginTime || "00:00:00";	//开始时间
  this.interval = initObj.interval || 0; //间隔时间
  this.complete = initObj.complete; //结束任务
  this.intervalFn = initObj.intervalFn; //间隔任务
  this.name = initObj.name; //当前计时器在计时器数组对象中的名字
  this.total_seconds = initObj.total_seconds; //传入时间戳,转化为总秒数
  this.intervarID; //计时ID
  this.endTime; //结束时间
  this.endSystemTime; //结束的系统时间
}

wxTimer.prototype = {
  //开始
  start: function(self) {
    this.endTime = this.total_seconds; //1970年1月1日的00：00：00的字符串日期

    this.endSystemTime = new Date(Date.now() + this.endTime);
    var that = this;
    //开始倒计时
    var count = 0; //这个count在这里应该是表示s数，js中获得时间是ms，所以下面*1000都换成ms
    function begin() {
      var tmpTime = that.endTime - count++;
      var time_onj = dateformat(tmpTime);
      var wxTimerHour = time_onj.hr;
      var wxTimerMinute = time_onj.min;
      var wxTimerSecond = time_onj.sec;
      var wxTimerList = self.data.wxTimerList;

      // console.log(wxTimerHour, wxTimerMinute, wxTimerSecond,tmpTime);
      //更新计时器数组
      wxTimerList[that.name] = {
        // wxTimer:tmpTimeStr,
        wxTimerHour: wxTimerHour,
        wxTimerMinute: wxTimerMinute,
        wxTimerSecond: wxTimerSecond
      }

      self.setData({
        // wxTimer:tmpTimeStr,
        wxTimerList: wxTimerList
      });
      //时间间隔执行函数
      if (0 == (count - 1) % that.interval && that.intervalFn) {
        that.intervalFn();
      }
      //结束执行函数
      if (tmpTime <= 0) {
        if (that.complete) {
          that.complete(that.name);
        }
        that.stop();
      }
    }
    begin();
    this.intervarID = setInterval(begin, 1000);
  },
  //结束
  stop: function() {
    clearInterval(this.intervarID);
  },
  //校准
  calibration: function() {
    // this.endTime = this.endSystemTime - Date.now();
  }
}

//小时
function dateformat_h(micro_second) {

  // 总秒数

  var second = Math.floor(micro_second / 1000);

  // 天数

  var day = Math.floor(second / 3600 / 24);
  // 总小时

  var hr = Math.floor(second / 3600);

  return hr;

}

function dateformat(second) {

  // 总秒数

  // var second = Math.floor(micro_second / 1000);

  // 天数

  var day = Math.floor(second / 3600 / 24);
  // 总小时

  var hr = Math.floor(second / 3600);

  // 小时位

  var hr2 = hr % 24;

  // 分钟位

  var min = Math.floor((second - hr * 3600) / 60);

  // 秒位

  var sec = (second - hr * 3600 - min * 60); // equal to => var sec = second % 60;
  if (hr < 10) {
    hr = prefixInteger(hr, 2);
  }
  // 毫秒位，保留2位
  return {
    'hr': hr,
    'min': prefixInteger(min, 2),
    'sec': prefixInteger(sec, 2)
  };
}

function prefixInteger(num, length) {
  return (Array(length).join('0') + num).slice(-length);
}
module.exports = wxTimer;