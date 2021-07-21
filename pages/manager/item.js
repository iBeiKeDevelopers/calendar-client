// pages/manager/item.js
const utils = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    type: '',
    subscribed: false,
    following: true,
    loading: true,
    fail: false,
    activities: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData(options)

    this.fetchData().then(() => {
      this.check().then(() => {
        if (!this.data.following && this.data.subscribed)
          wx.showModal({
            content: '检查到未关注iBeiKe公众号，你将无法接受活动提醒',
            showCancel: false
          })
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  fetchData(refresh = false) {
    const {
      name,
      type
    } = this.data
    if (refresh !== true)
      this.setData({
        loading: true,
        fail: false
      })
    return utils.request.get(`/v1/subscribe/${type}/${name}`).then(res => {
      for (let i of res.data.activities) {
        i.time_from = new Date(i.time_from)
        i.time_to = new Date(i.time_to)
        let m1 = i.time_from.getMinutes().toString().padStart(2, "0");
        let m2 = i.time_to.getMinutes().toString().padStart(2, "0");
        i.time = `${i.time_from.getMonth()}.${i.time_from.getDate()} ${i.time_from.getHours()}:${m1} - ${i.time_to.getHours()}:${m2}`
      }
      this.setData({
        ...res.data
      })
      if (refresh !== true)
        this.setData({
          fail: false,
          loading: false
        })
    }).catch(() => {
      if (refresh !== true)
        this.setData({
          fail: true
        })
    })
  },
  check() {
    return utils.request.get('/v1/is_following').then(res => {
      this.setData({
        following: res.ok
      })
    });
  },
  subscribe(e) {
    const {
      name,
      type
    } = this.data
    if (!this.data.following && !this.data.subscribed) {
      wx.showModal({
        content: '请先关注iBeiKe公众号，否则无法接受活动提醒',
        showCancel: false
      })
      return
    }

    utils.request.request(this.data.subscribed ? 'DELETE' : 'POST', `/v1/subscribe/${type}/${name}`).then(res => {
      if (!res.ok) {
        wx.showModal({
          content: '请先关注iBeiKe公众号，并回复绑定以开启功能',
          showCancel: false
        })
        return
      }
      this.fetchData(true)
    })
  }
})