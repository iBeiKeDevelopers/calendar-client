const Mon = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MonShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
const getMonth = (i) => Mon[i];
const getMonthShort = (i) => MonShort[i];
const getYear = () => (new Date()).getFullYear()
const getWeek = (day) => {
  const onejan = new Date(day.getFullYear(), 0, 1);
  return Math.ceil((((day.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
}
const request = (options) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `https://calendar.ibeike.hunsh.net` + options.url, //获取域名接口地址
      method: options.method,
      data: options.data,
      //如果是GET,GET自动让数据成为query String,其他方法需要让options.data转化为字符串
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      //header中可以监听到token值的变化
      success(r) {
        if (r.statusCode != 200 || r.data.error) {
          reject(r)
        } else {
          resolve(r.data)
        }
      },
      fail(error) {
        //返回失败也同样传入reject()方法
        reject(error)
      }
    })
  })
}
module.exports = {
  getMonth,
  getMonthShort,
  getYear,
  getWeek,
  request
}