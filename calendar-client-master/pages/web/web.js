// pages/web/web.js
Page({

  data: {
    url: "https://mp.weixin.qq.com/s/"
  },

  onLoad: function (options) {
    console.log(options)
    if (options.url) this.setData({ url: options.url })
  },

})