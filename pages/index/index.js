// index.js
// 获取应用实例
const app = getApp()
const utils = require('../../utils/util')
Page({
  data: {
    loading: true,
    fail: false,
    studyWeek: {
      "name": "",
      "week": 0
    },
    monthView: {
      current: 0,
      tab: 0,
      cal: [
        [],
        [],
        []
      ]
    },
    weekView: {
      week: 0,
      tab: 0,
      current: 0,
      now: null,
      cal: [
        [],
        [],
        []
      ]
    },
    calendarHeight: 0,
    month: (new Date()).getMonth(),
    monthText: utils.getMonth((new Date()).getMonth()),
    year: utils.getYear(),
    tab: 1,
    cache: {
      month: {},
      week: {}
    },
    month_data: [],
    week_data: []
  },
  doRequest(type, start, now = true) {
    start = (new Date(start.getTime()))
    start.setSeconds(0)
    start.setMinutes(0)
    start.setHours(0)
    type = type === 'week' ? 'week' : 'month'
    if (now && this.data.cache[type][start.getTime()] !== undefined) {
      this.setData({
        [type === 'week' ? 'week_data' : 'month_data']: this.data.cache[type][start.getTime()]
      })
      this.updateHeight()
    }
    if (now) {
      this.setData({
        loading: true,
        fail: false
      })
      this.updateHeight()
    }
    utils.request.get('/v1/events', {
      type,
      start: start.getTime()
    },{login_required: false}).then((result) => {
      for (let i of result.data) {
        i.time_from = new Date(i.time_from)
        i.time_to = new Date(i.time_to)
        let m1 = i.time_from.getMinutes().toString().padStart(2, "0");
        let m2 = i.time_to.getMinutes().toString().padStart(2, "0");
        i.time = `${i.time_from.getHours()}: ${m1} —— ${i.time_to.getHours()}: ${m2}`
        i.date = i.time_from.getDate()
        i.day = "周" + "日一二三四五六" [i.time_from.getDay()]
      }
      this.setData({
        ['cache.' + type + '.' + String(start.getTime())]: result.data
      })
      if (now) {
        this.setData({
          [type === 'week' ? 'week_data' : 'month_data']: this.data.cache[type][start.getTime()],
          loading: false,
        })
        this.updateHeight()
      }
    }).catch((result) => {
      console.error(result)
      if (now) {
        this.setData({
          fail: true
        })
        this.updateHeight()
      }
    })
  },
  toManager() {
    wx.navigateTo({
      url: '../manager/manager',
    })
  },
  updateHeight() {
    wx.nextTick(() => {
      let query = wx.createSelectorQuery();
      query.select(this.data.tab ? '#tab2' : '#tab1').boundingClientRect(rect => {
        let height = rect.height;
        if (height)
          this.setData({
            calendarHeight: height
          })
      }).exec();
    })
  },
  goToManagerItem(e) {
    const name = e.currentTarget.dataset.name
    const type = "tag"
    wx.navigateTo({
      url: `../manager/item?type=${type}&name=${name}`,
    })
  },
  showHelp() {
    wx.navigateTo({
      url: '../about/about'
    })
  },
  goto(e) {
    if (e.currentTarget.dataset.url)
      wx.navigateTo({
        url: '../web/web?url=' + e.currentTarget.dataset.url,
      })
  },

  updateCalendar(year, month, index, init = false) {
    const startDay = (new Date(year, month, 1));
    this.doRequest('month', startDay, init);
    const total = (new Date(year, month + 1, 0)).getDate();
    startDay.setDate(1 - startDay.getUTCDay());
    let day = startDay;
    const result = [];
    let tempGroup = [];
    let flag = 0;
    const today = new Date();
    while (true) {
      if (day.getDate() === 1) {
        if (flag === 0)
          flag = 1
        else if (flag === 1)
          flag = 2
      }
      tempGroup.push({
        isToday: day.getDate() == today.getDate() &&
          day.getMonth() == today.getMonth() &&
          day.getFullYear() == today.getFullYear(),
        value: day.getDate()
      });
      if (tempGroup.length === 7) {
        result.push({
          id: Number(day),
          value: tempGroup
        });
        tempGroup = [];
      }
      if ((flag === 2 || flag === 1 && day.getDate() === total) && day.getUTCDay() === 6) {
        break
      }
      day.setDate(day.getDate() + 1);
    }
    const i = `monthView.cal[${index}]`
    this.setData({
      [i]: result
    })
  },
  updateWeek(startDay, index, init = false) {
    const day = new Date(startDay);
    day.setDate(day.getDate() - day.getUTCDay() + 1);
    this.doRequest('week', day, init);
    const today = new Date();
    const result = [];
    for (let i = 0; i < 7; i++) {
      result.push({
        isToday: day.getDate() == today.getDate() &&
          day.getMonth() == today.getMonth() &&
          day.getFullYear() == today.getFullYear(),
        value: day.getDate()
      });
      day.setDate(day.getDate() + 1);
    }
    const i = `weekView.cal[${index}]`
    this.setData({
      [i]: result
    })
  },
  // 事件处理函数
  onLoad() {
    this.updateCalendar(this.data.year, this.data.month, 0, true);
    this.updateCalendar(this.data.year, this.data.month + 1, 1);
    this.updateCalendar(this.data.year, this.data.month - 1, 2);
    const day = new Date();
    day.setDate(day.getDate() + 1 - (day.getUTCDay() == 0 ? 7 : day.getUTCDay()));
    this.setData({
      'weekView.now': day,
      'weekView.week': utils.getWeek(day),
      "studyWeek": utils.getStudyWeek(day)
    })
    this.updateWeek(this.data.weekView.now, 0, true);
    this.updateWeek(new Date((new Date()).setDate(this.data.weekView.now.getDate() + 7)), 1);
    this.updateWeek(new Date((new Date()).setDate(this.data.weekView.now.getDate() - 7)), 2);
  },
  handleMonthTabChange(e) {
    const direct = this.data.monthView.tab - e.detail.current === 1 || this.data.monthView.tab - e.detail.current === -2 // 向上
    const day = new Date(this.data.year, this.data.month, 1);
    day.setMonth(day.getMonth() - (direct ? 1 : -1))
    this.setData({
      year: day.getFullYear(),
      month: day.getMonth(),
      monthText: utils.getMonth(day.getMonth()),
      'monthView.tab': e.detail.current
    })
    this.doRequest('month', day, true)
    let index;
    if (direct) {
      index = e.detail.current - 1 === -1 ? 2 : e.detail.current - 1
    } else {
      index = e.detail.current + 1 === 3 ? 0 : e.detail.current + 1
    }
    this.updateCalendar(this.data.year, this.data.month - (direct ? 1 : -1), index);
  },
  handleWeekTabChange(e) {
    const direct = this.data.weekView.tab - e.detail.current === 1 || this.data.weekView.tab - e.detail.current === -2 // 向左
    this.data.weekView.now.setDate(this.data.weekView.now.getDate() - (direct ? 7 : -7))
    const week_start = new Date(this.data.weekView.now)
    week_start.setDate(week_start.getDate() - week_start.getUTCDay() + 1)
    const week_end = new Date(this.data.weekView.now)
    week_end.setDate(week_end.getDate() + (7 - week_end.getUTCDay()))

    this.setData({
      monthText: week_start.getMonth() === week_end.getMonth() ? utils.getMonth(week_start.getMonth()) : `${utils.getMonthShort(week_start.getMonth())}/${utils.getMonthShort(week_end.getMonth())}`,
      'weekView.week': utils.getWeek(this.data.weekView.now),
      'weekView.tab': e.detail.current,
      "studyWeek": utils.getStudyWeek(week_start)
    })
    this.doRequest('week', this.data.weekView.now, true)
    let index;
    if (direct) {
      index = e.detail.current - 1 === -1 ? 2 : e.detail.current - 1
    } else {
      index = e.detail.current + 1 === 3 ? 0 : e.detail.current + 1
    }
    const a = new Date(this.data.weekView.now);
    this.updateWeek(new Date(a.setDate(a.getDate() - (direct ? 7 : -7))), index);
  },
  handleTabClick(e) {
    this.setData({
      tab: Number(e.target.dataset.id)
    })
    this.updateHeight()
  }
})