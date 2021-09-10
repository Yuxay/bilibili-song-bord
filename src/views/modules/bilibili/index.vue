<template>
  <div>
    <div>
      <div
        :style="{
          width: width + 'vw',
          margin: '0 auto',
          textAlign: 'left',
          padding: '10px',
          fontSize: '16px'
        }"
      >
        <div v-if="!isModify">
          直播间：<span>{{ roomId }}</span>
          <el-button @click="isModify = true">修改</el-button>
        </div>
        <el-row :gutter="20" v-else>
          <el-col :span="12" :offset="0">
            <el-input v-model="roomId" placeholder="输入房间号"></el-input>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-button @click="modifyRoomIdHandle(roomId)">确定</el-button>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="bili-bg" :style="{ width: width + 'vw' }">
      <div
        class="van-cell"
        :style="{ width: width + 'vw' }"
        style="
          position: fixed;
          top: 50px;
          height: 50px;
          word-break: break-all;
          white-space: pre-wrap;
        "
      >
        <span
          style="width: 30%; margin-right: 15px; opacity: 0.5; text-align: left"
          >用户</span
        >
        <span style="width: 40%; margin-right: 15px; text-align: left"
          >歌名</span
        >
        <span style="width: 30%; text-align: left">点歌时间</span>
      </div>
      <div style="padding-top: 40px">
        <van-swipe-cell
          v-if="!isEmpty(songArr)"
          style="margin-bottom: 10px"
          v-for="(item, index) in songArr"
          :key="index"
        >
          <div class="van-cell" :style="{ width: width + 'vw' }">
            <span
              style="
                width: 30%;
                margin-right: 15px;
                opacity: 0.5;
                text-align: left;
                word-break: break-all;
              "
            >
              {{ item.user }}
            </span>
            <span style="width: 40%; margin-right: 15px; text-align: left">{{
              item.name
            }}</span>
            <div style="width: 30%; text-align: left">
              {{ timeFun(item.time, true) }}
              <div class="del-btn" @click="delHandle(item, index)">
                删除
              </div>
            </div>
          </div>
        </van-swipe-cell>
      </div>
    </div>
  </div>
</template>
<script>
import pako from "pako";
import axios from "axios";
const instance = axios.create({
  headers: {
    timeout: 1000 * 30,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
      // 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
    }
    // Accept:
    //   "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    // "Sec-Fetch-Dest": "document",
    // "Sec-Fetch-Mode": "navigate",
    // "Sec-Fetch-Site": "none",
    // "Sec-Fetch-User": "?1",
    // "Upgrade-Insecure-Requests": "1"
  }
});
export default {
  data() {
    return {
      isMobile: false,
      isModify: false,
      timer: null,
      width: 100,
      songArr: [],
      wssUrl: "",
      searchTime: 0,
      ws_: null,
      roomId: 0
      // roomId: 22559300 // 闪闪
      // roomId: 13531845 // 我
      // roomId : 22932002, // 南一
      // roomId: 22863364 // 晚晚
      // roomId: 22887106 // 可儿
      // roomId: 12499589 // 萧萧
    };
  },
  beforeDestroy() {
    localStorage.removeItem("hasSocket");
  },
  mounted() {
    let tempId = localStorage.getItem("roomId");
    if (!this.isEmpty(tempId)) {
      this.roomId = parseInt(tempId);
      this.init(this.roomId);
    }
    if (!window.navigator) {
      // FR.Msg.alert("提示", "当前设备：移动端APP");
      this.isMobile = true;
      this.width = 100;
    } else {
      if (/Mobile|Android|webOS|iPhone|iPad|Phone/i.test(navigator.userAgent)) {
        // FR.Msg.alert("提示", "当前设备：移动端H5");
        this.isMobile = true;
        this.width = 100;
      } else {
        // FR.Msg.alert("提示", "当前设备：PC端");
        this.isMobile = false;
        this.width = 60;
      }
    }
  },
  methods: {
    modifyRoomIdHandle(e) {
      let _this = this;
      let idNum = parseInt(e);
      this.roomId = idNum;
      this.isModify = false;
      localStorage.setItem("roomId", e);
      if (!this.isEmpty(this.ws_)) {
        _this.ws_.close();
      }
      this.init(idNum);
    },
    delHandle(item, index) {
      // this.songArr.splice(index, 1);
      console.log(item);
      this.delSong(item);
    },
    init(idNum) {
      this.websocketInit("wss://broadcastlv.chat.bilibili.com/sub", idNum);
      this.getList();
    },
    websocketInit(wsUrl, idNum) {
      var lockReconnect = false; //避免重复连接
      var ws = null;
      let _this = this;
      // var ws = new WebSocket("wss://broadcastlv.chat.bilibili.com/sub");
      // var ws = new WebSocket(wsUrl);
      // _this.ws_ = ws;
      var json = {
        uid: 0,
        roomid: idNum, //
        protover: 1,
        platform: "web",
        clientver: "1.4.0"
      };
      createWebSocket(wsUrl, idNum);
      function createWebSocket(url, idNum) {
        if (!_this.isEmpty(_this.ws_)) {
        _this.ws_.close();
      }
        try {
          if ("WebSocket" in window) {
            ws = new WebSocket(url);
            _this.ws_ = ws;
          }
          initEventHandle(idNum);
        } catch (e) {
          reconnect(url);
          console.log(e);
        }
      }

      function initEventHandle(initEventRoomId) {
        // WebSocket连接成功回调
        ws.onopen = function() {
          json.roomid = initEventRoomId;
          console.log("WebSocket 已连接上");
          console.log(json);
          //组合认证数据包 并发送
          ws.send(_this.getCertification(JSON.stringify(json)).buffer);
          //心跳包的定时器
          _this.timer = setInterval(function() {
            //定时器 注意声明timer变量
            var n1 = new ArrayBuffer(16);
            var i = new DataView(n1);
            i.setUint32(0, 0), //封包总大小
              i.setUint16(4, 16), //头部长度
              i.setUint16(6, 1), //协议版本
              i.setUint32(8, 2), // 操作码 2 心跳包
              i.setUint32(12, 1); //就1
            ws.send(i.buffer); //发送
          }, 30000); //30秒
        };

        // WebSocket连接关闭回调
        ws.onclose = function(e) {
          // console.log("连接已关闭");
          console.error(e);
          //要在连接关闭的时候停止 心跳包的 定时器
          if (_this.timer != null) clearInterval(_this.timer);
          websocketReconnect(wsUrl, _this.roomId);
        };
        //WebSocket接收数据回调
        ws.onmessage = function(evt) {
          var blob = evt.data;
          //对数据进行解码 decode方法
          _this.decode(blob, function(packet) {
            //解码成功回调
            if (packet.op == 5) {
              //会同时有多个 数发过来 所以要循环
              console.log("body", packet.body);
              let arr = packet.body;
              arr.forEach(item => {
                let valType = Object.prototype.toString.call(item);
                if (valType === "[object Object]") {
                  if (item.cmd.indexOf("DANMU_MSG") >= 0) {
                    console.log(
                      "uid: " +
                        item.info[2][0] +
                        " 用户: " +
                        item.info[2][1] +
                        " \n内容: " +
                        item.info[1]
                    );
                    let cont_ = item.info[1];
                    if (!_this.isEmpty(cont_)) {
                      let re = /[\u4E00-\u9FA5]/g;
                      let contArr_ = cont_.split("");
                      // console.log("contArr_", contArr_);
                      let arr = cont_.match(re);
                      if (!_this.isEmpty(arr) && arr.length >= 2) {
                        if (arr[0] + arr[1] == "点歌") {
                          let obj = {};
                          let id = cont_.indexOf(arr[1]);
                          obj.uid = item.info[2][0];
                          obj.user = item.info[2][1];
                          obj.name = contArr_
                            .splice(id + 1)
                            .join("")
                            .replace(" ", "");
                          obj.time = item.info[0][4];
                          obj.roomId = _this.roomId;
                          _this.addSong(obj);
                          return;
                        }
                      }
                    }
                  } else if (item.cmd == "INTERACT_WORD") {
                    console.log("欢迎：" + item.data.uname + " 进入直播间");
                  } else if (item.cmd == "ENTRY_EFFECT") {
                    // console.log()
                    let str = item.data.copy_writing;
                    str.replace("<%", "");
                    str.replace("%>", "");
                    console.log(str);
                  } else if (item.cmd == "SEND_GIFT") {
                    console.log(
                      item.data.uname +
                        item.data.action +
                        "了一个" +
                        item.data.giftName
                    );
                  }
                }
              });
            }
          });
        };
        ws.onerror = function(evt) {
          console.error("错误", evt);
        };
      }

      function websocketReconnect(url, reconRoomId) {
        if (lockReconnect) {
          // 是否已经执行重连
          return;
        }
        lockReconnect = true;
        //没连接上会一直重连，设置延迟避免请求过多
        tt && clearTimeout(tt);
        var tt = setTimeout(function() {
          createWebSocket(url, reconRoomId);
          lockReconnect = false;
        }, 5000);
      }
    },
    getList() {
      let _this = this;
      this.$http({
        url: this.$http.adornUrl("/api/song/select_song"),
        method: "post",
        data: this.$http.adornData(
          { roomId: _this.roomId, time: _this.searchTime },
          false
        )
      })
        .then(({ data }) => {
          console.log(data);
          if (data && data.code == 0) {
            let arr = data.data;
            _this.songArr = arr;
          } else {
            _this.songArr = [];
          }
        })
        .catch(err => {
          _this.songArr = [];
          console.error(err);
        });
    },
    addSong(obj) {
      let _this = this;
      this.$http({
        url: this.$http.adornUrl("/api/song/add_song"),
        method: "post",
        data: this.$http.adornData(obj, false)
      })
        .then(({ data }) => {
          console.log(data);
          if (data && data.code == 0) {
            this.$notify({
              title: "提示",
              message: "点歌成功!",
              type: "success",
              duration: 1000,
              onClose: function() {
                _this.getList();
              }
            });
          }
        })
        .catch(err => {
          console.error(err);
        });
    },
    delSong(item) {
      let _this = this;
      this.$http({
        url: this.$http.adornUrl("/api/song/delete_song"),
        method: "post",
        data: this.$http.adornData({ roomId: item.roomId, id: item.id }, false)
      })
        .then(({ data }) => {
          if (data && data.code == 0) {
            this.$notify({
              title: "提示",
              message: "删除成功！",
              duration: 1000,
              onClose: function() {
                _this.getList();
              }
            });
          }
          console.log(data);
        })
        .catch(err => {
          console.error(err);
        });
    },
    //组合认证数据包
    getCertification(json) {
      let _this = this;
      var bytes = _this.str2bytes(json); //字符串转bytes
      var n1 = new ArrayBuffer(bytes.length + 16);
      var i = new DataView(n1);
      i.setUint32(0, bytes.length + 16), //封包总大小
        i.setUint16(4, 16), //头部长度
        i.setUint16(6, 1), //协议版本
        i.setUint32(8, 7), //操作码 7表示认证并加入房间
        i.setUint32(12, 1); //就1
      for (var r = 0; r < bytes.length; r++) {
        i.setUint8(16 + r, bytes[r]); //把要认证的数据添加进去
      }
      return i; //返回
    },
    //字符串转bytes //这个方法是从网上找的QAQ
    str2bytes(str) {
      const bytes = [];
      let c;
      const len = str.length;
      for (let i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if (c >= 0x010000 && c <= 0x10ffff) {
          bytes.push(((c >> 18) & 0x07) | 0xf0);
          bytes.push(((c >> 12) & 0x3f) | 0x80);
          bytes.push(((c >> 6) & 0x3f) | 0x80);
          bytes.push((c & 0x3f) | 0x80);
        } else if (c >= 0x000800 && c <= 0x00ffff) {
          bytes.push(((c >> 12) & 0x0f) | 0xe0);
          bytes.push(((c >> 6) & 0x3f) | 0x80);
          bytes.push((c & 0x3f) | 0x80);
        } else if (c >= 0x000080 && c <= 0x0007ff) {
          bytes.push(((c >> 6) & 0x1f) | 0xc0);
          bytes.push((c & 0x3f) | 0x80);
        } else {
          bytes.push(c & 0xff);
        }
      }
      return bytes;
    },
    /**
     * blob blob数据
     * call 回调 解析数据会通过回调返回数据
     */
    decode(blob, call) {
      // 文本解码器
      var textDecoder = new TextDecoder("utf-8");
      // 从buffer中读取int
      const readInt = function(buffer, start, len) {
        let result = 0;
        for (let i = len - 1; i >= 0; i--) {
          result += Math.pow(256, len - i - 1) * buffer[start + i];
        }
        return result;
      };
      let reader = new FileReader();
      reader.onload = function(e) {
        let buffer = new Uint8Array(e.target.result);
        let result = {};
        result.packetLen = readInt(buffer, 0, 4);
        result.headerLen = readInt(buffer, 4, 2);
        result.ver = readInt(buffer, 6, 2);
        result.op = readInt(buffer, 8, 4);
        result.seq = readInt(buffer, 12, 4);
        if (result.op == 5) {
          result.body = [];
          let offset = 0;
          while (offset < buffer.length) {
            let packetLen = readInt(buffer, offset + 0, 4);
            let headerLen = 16; // readInt(buffer,offset + 4,4)
            let data = buffer.slice(offset + headerLen, offset + packetLen);

            let body = "{}";
            if (result.ver == 2) {
              //协议版本为 2 时  数据有进行压缩 通过pako.js 进行解压
              body = textDecoder.decode(pako.inflate(data));
            } else {
              //协议版本为 0 时  数据没有进行压缩
              body = textDecoder.decode(data);
            }
            if (body) {
              // 同一条消息中可能存在多条信息，用正则筛出来
              const group = body.split(/[\x00-\x1f]+/);
              group.forEach(item => {
                try {
                  result.body.push(JSON.parse(item));
                } catch (e) {
                  // 忽略非JSON字符串，通常情况下为分隔符
                }
              });
            }
            offset += packetLen;
          }
        }
        //回调
        call(result);
      };
      console.log(blob)
      reader.readAsArrayBuffer(blob);
    }
  }
};
</script>
<style lang="scss">
.bili-bg {
  background: url("https://img2.baidu.com/it/u=2666815300,259202041&fm=15&fmt=auto&gp=0.jpg")
    no-repeat;
  background-size: 100% 100%;
  margin: 0 auto;
}
.van-cell {
  background: transparent;
  font-size: 18px;
  color: #000;
  position: relative;
}
.del-btn {
  // position: absolute;
  // right: 5px;
  // top: 10px;
  cursor: pointer;
  color: rgb(238, 10, 36);
}
</style>
