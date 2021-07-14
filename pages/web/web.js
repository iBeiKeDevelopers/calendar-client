// pages/web/web.js
Page({

  data: {
    url: "https://mp.weixin.qq.com/s/"
  },
  onShow: function (options) {
    console.log("show")
  },

  onLoad: function (options) {
    console.log(options)
    if (options.url) this.setData({ url: options.url }) 
    else {
      wx.navigateBack({
        delta: 0,
      })
    }
  },

})