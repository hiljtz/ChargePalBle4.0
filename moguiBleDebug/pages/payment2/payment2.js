var config = require('../../config');
const paymentUrl = config.paymentUrl
const payorderUrl = config.payorderUrl
var utilMd5 = require('../../utils/md5.js');
var util = require('../../utils/util.js');
var app = getApp();

var app = getApp()
function RandomNumBoth(Min, Max) {
  var Range = Max - Min;
  var Rand = Math.random();
  var num = Min + Math.round(Rand * Range); //四舍五入
  return num;
}
Page({
  onLoad: function () {
    var that = this;
    this.setData({
     
      payproduct: config.payproduct,
    });
    app.getUserOpenId(function (err, openid) {
      if (!err) {
        wx.request({
          url: "https://s.imogui.cn/wxuser-accountstatus",
          data: {
            openid
          },
          method: 'post',
          success: function (res) {
            that.setData({
              deposit: res.data.Deposit,
              UnAmount: res.data.UnAmount,
              IsReturn: res.data.IsReturn
            })

          }
        });
      }
    })
  },

  requestPayment: function () {
    var self = this;
    self.setData({
      loading: true
    })
    // 此处需要先调用wx.login方法获取code，然后在服务端调用微信接口使用code换取下单用户的openId
    // 具体文档参考https://mp.weixin.qq.com/debug/wxadoc/dev/api/api-login.html?t=20161230#wxloginobject
    app.getUserOpenId(function (err, openid) {
 
      var unamount = self.data.UnAmount;
  if (!err) {
        wx.request({
          url: paymentUrl,
          data: {
            openid, 
            total_fee: unamount, 
            ordertype:3
          },
          method: 'POST',
          success: function (res) {
            console.log('unified order success, response is:', res)
            var payargs = res.data.value.payargs;
            var v = res.data.value;
            var timestamp = Date.parse(new Date()) / 1000;
            var r = RandomNumBoth(999, 1000000);
            var sign = utilMd5.hexMD5("appId=wx3e3ad2ac43e3d4ef&nonceStr=" + r + "&package=prepay_id=" + payargs.prepay_id + "&signType=MD5&timeStamp=" + timestamp + "&key=393461d35c7bbfdabbc814f7298c5a8f");

            wx.requestPayment({
              timeStamp: "" + timestamp,
              nonceStr: "" + r,
              package: "prepay_id=" + payargs.prepay_id,
              signType: "MD5",
              paySign: sign,
              'success': function (res) {
                console.log(v, v.out_trade_no);
                wx.request({
                  url: payorderUrl + "/" + v.out_trade_no,
                  method: 'GET',
                   'success': function () {
                    wx.navigateTo({
                      url: '/pages/index/index'
                    })}
                })

              },
              'fail': function (res) {

                console.log(res)
              },

            })

            self.setData({
              loading: false
            })
          }
        })
      } else {
        console.log('err:', err)
        self.setData({
          loading: false
        })
      }
    })
  }
})
