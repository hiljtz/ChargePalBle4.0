
/**
 * 连接设备。获取数据
 */
function buf2hex(buffer) { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join(':');
}
function isContains(str, substr) {
  return str.indexOf(substr) >= 0;
}
function blueIni(that){

  wx.openBluetoothAdapter({
    success: function (res) {

      that.setData({
        openBluetooth: true
      })

      getDevices(that);


    },
    fail: function (res) {
      that.setData({
        openBluetooth: false
      })


    }
  })
}
function loading() {

  wx.showLoading({
    title: '蓝牙连接中...',
    mask:true
  })


  setTimeout(function () {
    wx.hideLoading()
  }, 1000)
}
function getDevices(that) {
  wx.onBluetoothAdapterStateChange(function (res) {
    console.log("蓝牙适配器状态变化", res);
    if (res.available) {
      getDevices(that);

    }
    that.setData({
      openBluetooth: res.available ? true : false,
      searchingstatus: res.discovering ? true : false
    })

  })


  wx.startBluetoothDevicesDiscovery({

    success: function (res) {

      console.log("startBluetoothDevicesDiscovery", res);
    },
    fail: function (res) {

      console.log(res);
    },
    complete: function (res) {

      console.log(res);
    }
  })

  wx.getConnectedBluetoothDevices({
    success: function (res) {
      console.log("getConnectedBluetoothDevices",res)
    }
  });
  //所有设备
  wx.getBluetoothDevices({

    success: function (res) {

      console.log("getBluetoothDevices", res);
      
      for (var k=0; k<res.devices.length;k++) {
       // console.log("k", res.devices[k]);
        let hex="";
   try{
     hex = buf2hex(res.devices[k].advertisData).split(':');
     console.log("hex",hex)
        }
        catch(e){
      hex="";
   
        }
      var s = "";
      for (var i = hex.length - 1; i >= 0; i--) {
        s = s + hex[i];
      }
      //console.log("ss", that.data.platform);
      var isCon=0;
        for (var i = 0; i <that.data.moguiDevices.length;i++) {
          if (that.data.moguiDevices[i].deviceId == res.devices[k].deviceId){
            isCon = 1;
            }
            }
      if (isCon==0)
        that.data.moguiDevices.push(JSON.parse("{\"deviceId\":\"" + res.devices[k].deviceId + "\",\"advertis\":\"" + s + "\"}"));

      }
     
    
          },
    fail: function (res) {
      console.log(res);
    },
    complete: function (res) {
      console.log(res);
    }
  })

  //新设备包含连接的
  wx.onBluetoothDeviceFound(function (res) {

   // console.log("onBluetoothDeviceFound", res);

    for (var k = 0; k < res.devices.length; k++) {
     // console.log("k", res.devices[k]);
      let hex = "";
      try {
        hex = buf2hex(res.devices[k].advertisData).split(':');
        //console.log("hex",hex)
      }
      catch (e) {
        hex = "";
       
      }
      var s = "";
      for (var i = hex.length - 1; i >= 0; i--) {
        s = s + hex[i];
      }
      //console.log("ss", that.data.platform);
      var isCon = 0;
      for (var i = 0; i < that.data.moguiDevices.length; i++) {
        if (that.data.moguiDevices[i].deviceId == res.devices[k].deviceId) {
          isCon = 1;
        }
      }
      if (isCon == 0)
        that.data.moguiDevices.push(JSON.parse("{\"deviceId\":\"" + res.devices[k].deviceId + "\",\"advertis\":\"" + s + "\"}"));

    }
  // console.log("that.data.moguiDevices2", that.data.moguiDevices);
  }

  );
  wx.onBLEConnectionStateChanged(function (res) {
    console.log(`onBLEConnection ${res.deviceId} state has changed, connected: ${res.connected}`)
  })
};
let platform;

Page({
    data: {
        
        userInfo: {},
        deviceId: '',
        name: '',
        serviceId: '',
        services: [],
        moguiDevices:[],
        

    },
    onLoad: function () {
     
      var that = this;
    
        try {
          var res = wx.getSystemInfoSync()
         // console.log(res.model)
         // console.log(res.pixelRatio)
         // console.log(res.windowWidth)
         // console.log(res.windowHeight)
         // console.log(res.language)
         // console.log(res.version)
         // console.log(res.platform);
          that.setData({ platform: res.platform });
          that.setData({ Id0:"" });
        } catch (e) {
          
        }
       
      blueIni(that);
       
    
  
    },
   
    modalTap: function (e) {
      var that = this;
      if (!that.data.openBluetooth) {
      wx.showModal({
        title: "",
        content: "请打开蓝牙！",
        showCancel: false,
        confirmText: "确定",

        
      })}
    },
   

scan:function(){
  var that=this;
   blueIni(that); 
   setTimeout(function () {
  if (!that.data.openBluetooth) {that.modalTap() }
  else
  wx.scanCode({
    success: function (res) {
      /**
     * 监听设备的连接状态
     */
      loading();
      console.log(res.result);
      var scanDeviceId = res.result.split('_')[1].split('/')[1];
      var hexDeviceId = parseInt(scanDeviceId.substring(1, scanDeviceId.length)).toString(16);
      var headStr = "000002000000";
      scanDeviceId = headStr.substring(0, headStr.length - hexDeviceId.length) + hexDeviceId;
  var currentDeviceId="";
 // console.log(scanDeviceId)
  //console.log("that.data.moguiDevices", that.data.moguiDevices)
  
    for(var i=0;i<that.data.moguiDevices.length;i++){
      if (that.data.moguiDevices[i].deviceId.replace(/:/g,"") == scanDeviceId){
        currentDeviceId = that.data.moguiDevices[i].deviceId;
      } else if (that.data.moguiDevices[i].advertis == scanDeviceId){
        currentDeviceId = that.data.moguiDevices[i].deviceId;
      }
    }
    that.setData({
      deviceId: currentDeviceId== ""?"未发现该设备":currentDeviceId
    });
   // console.log("deviceId",that.data.deviceId)
    if (that.data.currentDeviceId!=""){
      wx.createBLEConnection({
        deviceId: that.data.deviceId,
        success: function (res) {
         
          
          console.log("createBLEConnection",res);
          /**
           * 连接成功，后开始获取设备的服务列表
           */
          wx.getBLEDeviceServices({
            // 这里的 deviceId 需要在上面的 getBluetoothDevices中获取
            deviceId: that.data.deviceId,
            success: function (res) {
                  console.log("service",res);
  for (var i = 0; i < res.services.length;i++){
 if(isContains(res.services[i].uuid,"FFB0"))
{
   that.setData({
     serviceId: res.services[i].uuid
   });
}
 console.log("service", res.services[i])
}
  wx.showLoading({
    title: '蓝牙连接中...',
    mask: true
  })
              /**
               * 延迟3秒，根据服务获取特征 
               */
              setTimeout(function () {
                wx.getBLEDeviceCharacteristics({
                  // 这里的 deviceId 需要在上面的 getBluetoothDevices
                  deviceId: that.data.deviceId,
                  // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                  serviceId: that.data.serviceId ,
                  success: function (res) {
                   
                    console.log('device getBLEDeviceCharacteristics:', res.characteristics);
                    that.setData({
                      characteristics: res.characteristics
                    });
                    that.active();
                    wx.hideLoading();

                    wx.notifyBLECharacteristicValueChanged({
                      deviceId: that.data.deviceId,
                      serviceId: that.data.serviceId,
                      characteristicId: that.data.characteristics[1].uuid,
                      state: true,
                      success: function (res) {
                        // success
                        console.log('notifyBLECharacteristicValueChanged success', res);
                      },
                      fail: function (res) {
                        // fail
                      },
                      complete: function (res) {
                        // complete
                      }
                    })

                    // 这里的回调可以获取到 write 导致的特征值改变
                    wx.onBLECharacteristicValueChange(function (res) {
                      let hex = Array.prototype.map.call(new Uint8Array(res.value), x => ('00' + x.toString(16)).slice(-2)).join(''); console.log("onBLECharacteristicValueChange",hex)
var head=hex.substring(0,4);
if(head=="5502"){
  that.setData({
    eValue: hex.substring(4, 6)
  })
  console.log(that.data.eValue)
}
                    })

                  }, fail: function (res) {
                    console.log(res);
                  }
                })
              }
                ,3000);
            }
          })
        },
        fail: function (res) {
          // fail
        },
        complete: function (res) {
          // complete
        }
      })
    }
     
 
    }
})
   },2000)
},

    /**
     * 发送 数据到设备中
     */
    charge60: function () {
      
        var that = this;
        var hex = '55e1003c'
        var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
            return parseInt(h, 16)
        }))
        //console.log("m",typedArray)
      
        var buffer1 = typedArray.buffer
        console.log(buffer1)
        console.log(that.data);

     
        wx.writeBLECharacteristicValue({
            deviceId: that.data.deviceId,
            serviceId: that.data.serviceId,
            characteristicId: that.data.characteristics[0].uuid,
            value: buffer1,
            success: function (res) {
                // success
                console.log("success  指令发送成功",hex);
                that.setData({
                  hexComm: hex
                })
                console.log(res);
            },
            fail: function (res) {
                // fail
                console.log(res);
            },
            complete: function (res) {
                // complete
            }
        })

    },
    /**
 * 发送 数据到设备中
 */
    charge250: function () {

      var that = this;
      var hex = '55e100fa'
      var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
      }))
      //console.log("m",typedArray)

      var buffer1 = typedArray.buffer
      console.log(buffer1)
      console.log(that.data);


      wx.writeBLECharacteristicValue({
        deviceId: that.data.deviceId,
        serviceId: that.data.serviceId,
        characteristicId: that.data.characteristics[0].uuid,
        value: buffer1,
        success: function (res) {
          // success
          console.log("success  指令发送成功", hex);
          that.setData({
            hexComm: hex
          })
          console.log(res);
        },
        fail: function (res) {
          // fail
          console.log(res);
        },
        complete: function (res) {
          // complete
        }
      })

    },
    active: function () {

      var that = this;
      var hex = '000000'
      var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
      }))
      //console.log("m",typedArray)

      var buffer1 = typedArray.buffer
      console.log(buffer1)
      console.log(that.data);


      wx.writeBLECharacteristicValue({
        deviceId: that.data.deviceId,
        serviceId: that.data.serviceId,
        characteristicId: that.data.characteristics[0].uuid,
        value: buffer1,
        success: function (res) {
          // success
          console.log("success  指令发送成功", hex);
          that.setData({
            hexComm: hex
          })
          console.log(res);
        },
        fail: function (res) {
          // fail
          console.log(res);
        },
        complete: function (res) {
          // complete
        }
      })

    },
    /**
 * 发送 关闭数据到设备中
 */
    close: function () {
    
      var that = this;
     
      var hex = '55e0'
      var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
      }))
      console.log("m", typedArray)
      that.active();
      var buffer1 = typedArray.buffer
      console.log(buffer1)
      console.log(that.data);
      wx.writeBLECharacteristicValue({
        deviceId: that.data.deviceId,
        serviceId: that.data.serviceId,
        characteristicId: that.data.characteristics[0].uuid,
        value: buffer1,
        success: function (res) {
          
          // success
          console.log("success  指令发送成功","55e0");
          that.setData({
            hexComm:hex
          })
          console.log(res);
        },
        fail: function (res) {
          // fail
          console.log(res);
        },
        complete: function (res) {
          // complete
        }
      })
      
    },
    query: function () {

      var that = this;
      var hex = '5503'
      var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
      }))
      console.log("m", typedArray)

      var buffer1 = typedArray.buffer
      console.log(buffer1)
      console.log(that.data);


      wx.writeBLECharacteristicValue({
        deviceId: that.data.deviceId,
        serviceId: that.data.serviceId,
        characteristicId: that.data.characteristics[0].uuid,
        value: buffer1,
        success: function (res) {
          // success
          console.log("success  指令发送成功",hex);
          that.setData({
            hexComm: hex
          })
          console.log(res);
        },
        fail: function (res) {
          // fail
          console.log(res);
        },
        complete: function (res) {
          // complete
        }
      })
    },
    seeInfo:function () {

      var that = this;
      var hex = '5501'
      var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
      }))
      console.log("m", typedArray)

      var buffer1 = typedArray.buffer
      console.log(buffer1)
      console.log(that.data);


      wx.writeBLECharacteristicValue({
        deviceId: that.data.deviceId,
        serviceId: that.data.serviceId,
        characteristicId: that.data.characteristics[0].uuid,
        value: buffer1,
        success: function (res) {
       
          console.log("success  指令发送成功",hex);
          that.setData({
            hexComm: hex
          })
          console.log("电量",res);
        },
        fail: function (res) {
          // fail
          console.log(res);
        },
        complete: function (res) {
          // complete
        }
      })
    },
    setId: function () {

      var that = this;
      var hex = '5533FFAAEE'
      var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
      }))
      console.log("m", typedArray)

      var buffer1 = typedArray.buffer
      console.log(buffer1)
      console.log(that.data);
      wx.writeBLECharacteristicValue({
        deviceId: that.data.deviceId,
        serviceId: that.data.serviceId,
        characteristicId: that.data.characteristics[0].uuid,
        value: buffer1,
        success: function (res) {
          // success
          console.log("success  指令发送成功",hex);
          that.setData({
            hexComm: hex
          })
          console.log(res);
        },
        fail: function (res) {
          // fail
          console.log(res);
        },
        complete: function (res) {
          // complete
        }
      })





    },
    setStatus: function () {

      var that = this;
      var hex = '55A5'
      var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
      }))
      console.log("m", typedArray)

      var buffer1 = typedArray.buffer
      console.log(buffer1)
      console.log(that.data);


      wx.writeBLECharacteristicValue({
        deviceId: that.data.deviceId,
        serviceId: that.data.serviceId,
        characteristicId: that.data.characteristics[0].uuid,
        value: buffer1,
        success: function (res) {
          // success

          console.log("success  指令发送成功",hex);
          that.setData({
            hexComm: hex
          })
          console.log(res);
        },
        fail: function (res) {
          // fail
          console.log(res);
        },
        complete: function (res) {
          // complete
        }
      })





    },
closeConn: function () {
  var that=this;
  wx.closeBLEConnection({
    deviceId: that.data.deviceId,
    success: function (res) {
      console.log("closed", res)
    }, fail: function (res) {
      console.log("closed fail", res)
    }
  
  })





  }
  
})