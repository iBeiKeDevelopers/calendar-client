// components/loading.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    fail: {
      type: Boolean,
      value: false
    },
    text: {
      type: String,
      value: '点击重试'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    refresh() {
      this.triggerEvent('refresh')
    }
  }
})