// pages/manager.js
const utils = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    fail: false,
    following: true,
    data: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.fetchData().then(() => {
      this.check().then(() => {
        if (!this.data.following)
          for (let i of this.data.data) {
            if (i.subscribed) {
              wx.showModal({
                content: '检查到未关注iBeiKe公众号，你将无法接受活动提醒',
                showCancel: false
              })
              break
            }
          }
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  fetchData(refresh = false) {
    if (refresh !== true)
      this.setData({
        loading: true,
        fail: false
      })
    return utils.request.get('/v1/subscribes').then(res => {
      this.setData({
        data: res.data.tags
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
  goToDetail(e) {
    const name = e.currentTarget.dataset.name
    const type = "tag"
    // const item = this.data.data.filter(i => i.name === name)[0]
    wx.navigateTo({
      url: `item?type=${type}&name=${name}`,
    })
  },
  subscribe(e) {
    const name = e.currentTarget.dataset.name
    const type = "tag"
    const item = this.data.data.filter(i => i.name === name)[0]
    if (!this.data.following && !item.subscribed) {
      wx.showModal({
        content: '请先关注iBeiKe公众号，否则无法接受活动提醒',
        showCancel: false
      })
      return
    }

    utils.request.request(item.subscribed ? 'DELETE' : 'POST', `/v1/subscribe/${type}/${name}`).then(res => {
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