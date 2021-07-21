const Mon = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MonShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
const getMonth = (i) => Mon[i];
const getMonthShort = (i) => MonShort[i];
const getYear = () => (new Date()).getFullYear()
const getWeek = (day) => {
  const onejan = new Date(day.getFullYear(), 0, 1);
  return Math.ceil((((day.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
}
const calendar = require('./calendar_data')
for (const i of calendar) {
  i.start = new Date(i.start)
  i.end = new Date(i.end)
  i.skip = i.skip.map(x => [new Date(x), new Date(Number(new Date(x)) + 60 * 60 * 24 * 6 * 1000)])
  console.log(i.skip)
}
const getStudyWeek = (day) => {
  for (const i of calendar) {
    if (i.start <= day && day <= i.end) {
      let n = 0
      for (const x of i.skip) {
        if (day > x[1])
          n += 1
        console.log(x, day)
        if (x[0] <= day && day <= x[1]) {
          console.log(x)
          return {
            "name": "",
            "week": 0
          }
        }
      }
      return {
        "name": i.name,
        "week": Math.ceil((((day.getTime() - i.start.getTime()) / 86400000) + i.start.getDay() + 1) / 7) - n
      }
    }
  }
  return {
    "name": "",
    "week": 0
  }
}
class Request {
  constructor() {
    // this.baseURL = 'https://calendar.ibeike.hunsh.net'
    this.baseURL = 'http://127.0.0.1:60031'
  }
  async __getCode() {
    let token = wx.getStorageSync('token')

    if (!token) {
      token = await this.login()
    }
    return token
  }
  login() {
    const vm = this
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          vm.post('/v1/login', {
            code: res.code
          }, {
            login_required: false
          }).then(res => {
            wx.setStorage({
              key: 'token',
              data: res.token
            })
            resolve(res.token)
          }).catch(e => {
            reject(e)
          })
        },
        fail: e => {
          console.error(e)
          reject(e)
        }
      })
    })
  }
  get(...params) {
    return this.request('GET', ...params)
  }
  post(...params) {
    return this.request('POST', ...params)
  }
  async __headerPrepare(login_required) {
    const header = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    if (login_required) {
      header['Authorization'] = 'Bearer ' + await this.__getCode()
    }
    return header
  }
  request(method, url, data, {
    login_required = true,
    retry = false
  } = {}) {
    const vm = this

    return new Promise((resolve, reject) => {
      this.__headerPrepare(login_required).then(header => {
        wx.request({
          url: vm.baseURL + url,
          header,
          data,
          method,
          timeout: 2000,
          success(r) {
            if (r.statusCode === 401) {
              if (retry) {
                reject({
                  msg: "login fail"
                })
                return
              }
              vm.login().then(
                vm.request(method, url, data, {
                  login_required,
                  retry: true
                }).then(r => {
                  resolve(r)
                }).catch(e => {
                  reject(e)
                })
              ).catch(e => {
                reject(e)
              })
            } else if (r.statusCode != 200 || r.data.error) {
              reject(r)
            } else {
              resolve(r.data)
            }
          },
          fail(e) {
            reject({
              msg: '请求失败',
              e
            })
          }
        })
      })
    })
  }
}
const request = new Request()
module.exports = {
  getMonth,
  getMonthShort,
  getYear,
  getWeek,
  getStudyWeek,
  request
}