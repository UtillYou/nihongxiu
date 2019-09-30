Component({
  /**
   * 组件的属性列表
   */
  properties: {
    value:{
      type: Array,
      value: [0]
    }, 
    pickerShow: {
      type: Boolean, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer(newVal, oldVal, changedPath) {
        // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
        // 通常 newVal 就是新设置的数据， oldVal 是旧数据
      }
    }, 
    // isShadow: {
    //   type: Boolean,
    //   value: true,
    //   observer(newVal, oldVal, changedPath) { }
    // },
    range: {
      type: Array,
      value: []
    },
    // title: {
    //   type: Array,
    //   value: []
    // },
    // value: {// picker-view 内的 picker-view-column 当前选择的是第几项
    //   type: Array,
    //   value: [0, 0]
    // }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    pickerHandler() {// 控制弹出层显示隐藏
      this.setData({ pickerShow: !this.data.pickerShow })
    },
    bindChange(e) {// value 改变时触发 change 事件
      const val = e.detail.value
      this.setData({ value: val })
      let arr = this.data.value[0]
      this.triggerEvent('change', arr, {})
    },
    pickerFinish() {// 滚动选择器 - 完成
      
      let arr = this.data.value[0]
      this.pickerHandler()
      this.triggerEvent('finish', arr, {})
    },
    pickerCancel() {// 滚动选择器 - 取消
      this.pickerHandler()
      this.triggerEvent('cancel', '', {})
    },
    pickerCheck(){
      let arr = this.data.value[0];
      this.triggerEvent('check', arr, {})
    },
  }
})