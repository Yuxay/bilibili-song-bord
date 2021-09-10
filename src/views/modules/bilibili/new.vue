<template>
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
      <el-row>
        <el-col :span="20" :offset="0">
          <div v-if="!isModify">
            直播间：<span>{{ roomId }}</span>
            <el-button size="mini" @click="isModify = true">修改</el-button>
          </div>
          <div v-else>
            <el-input
              size="mini"
              style="max-width:150px"
              v-model="roomId"
              clearable
              placeholder="输入房间号"
            ></el-input>
            <el-button size="mini" @click="modifyRoomIdHandle(roomId)"
              >确定</el-button
            >
          </div>
        </el-col>
        <el-col :span="4" :offset="0">
          <el-button size="mini" @click="modifyRoomIdHandle(roomId)"
            >确定</el-button
          >
        </el-col>
      </el-row>
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
            <span
              class="animate"
              style="width: 40%; margin-right: 15px; text-align: left"
            >
              {{ item.name }}
            </span>
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
      socketTask: null,
      lockReconnect: false,
      liveTime: "", // 开播时间
      isMobile: false,
      isModify: false,
      timer: null,
      width: 100,
      songArr: [],
      wssUrl: "wss://broadcastlv.chat.bilibili.com/sub",
      roomId: 0
      // roomId: 22559300 // 闪闪
      // roomId: 13531845 // 我
      // roomId : 22932002, // 南一
      // roomId: 22863364 // 晚晚
      // roomId: 22887106 // 可儿
      // roomId: 12499589 // 萧萧
      // roomId: 22864611 // 苏苏
    };
  },
  mounted() {
    let tempId = localStorage.getItem("roomId");
    if (!this.isEmpty(tempId)) {
      this.roomId = parseInt(tempId);
      this.openConnection();
    }
    this.getRoomLiveInfo();
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
    getRoomLiveInfo() {
      let _this = this;
      this.$http({
        url:
          "/pc/room/v1/Room/get_info?device=phone&;platform=ios&scale=3&build=10000&room_id=" +
          _this.roomId,
        method: "get"
      })
        .then(({ data }) => {
          console.log("data: ", data);
          if (data && data.code == 0) {
            _this.liveTime = data.data.live_time;
          }
        })
        .catch(err => {
          console.log("err: ", err);
        });
    },
    modifyRoomIdHandle(e) {
      if (!this.isEmpty(e)) {
        let _this = this;
        let idNum = parseInt(e);
        this.roomId = idNum;
        this.isModify = false;
        localStorage.setItem("roomId", e);
        _this.socketTask.close();
        _this.openConnection();
        _this.getRoomLiveInfo;
      } else {
        this.roomId = 0;
      }
    },
    /** 打开连接 */
    openConnection() {
      let _this = this;
      _this.createWebSocket();
    },
    createWebSocket() {
      let _this = this;
      if (!_this.isEmpty(_this.socketTask)) {
        _this.socketTask.close();
      }
      try {
        if ("WebSocket" in window) {
          _this.socketTask = new WebSocket(_this.wssUrl);
        }
        _this.initEventHandle();
      } catch (e) {
        _this.reconnect(url);
        console.log(e);
      }
    },
    /** 已创建socket连接 */
    initEventHandle() {
      let _this = this;
      var json = {
        uid: 0,
        roomid: _this.roomId, //
        protover: 1,
        platform: "web",
        clientver: "1.4.0"
      };
      // WebSocket连接成功回调
      _this.socketTask.onopen = function() {
        console.log("WebSocket 已连接上");
        //组合认证数据包 并发送
        _this.socketTask.send(
          _this.getCertification(JSON.stringify(json)).buffer
        );
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
          _this.socketTask.send(i.buffer); //发送
        }, 30000); //30秒
      };

      // WebSocket接收服务器消息回调
      _this.socketTask.onmessage = function(evt) {
        _this.dealMsg(evt);
      };

      // WebSocket连接关闭回调
      _this.socketTask.onclose = function(e) {
        console.log("连接已关闭: ", e);
        //要在连接关闭的时候停止 心跳包的 定时器
        if (_this.timer != null) clearInterval(_this.timer);
        _this.websocketReconnect();
      };
    },
    /** 处理接收到的服务器消息 */
    dealMsg(evt) {
      let _this = this;
      var blob = evt.data;
      console.log("接收到服务器消息: ", blob);
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
    },
    /** socket重连 */
    websocketReconnect() {
      let _this = this;
      if (_this.lockReconnect) {
        // 是否已经执行重连
        return;
      }
      _this.lockReconnect = true;
      //没连接上会一直重连，设置延迟避免请求过多
      tt && clearTimeout(tt);
      var tt = setTimeout(function() {
        _this.createWebSocket();
        _this.lockReconnect = false;
      }, 5000);
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
.animate {
  padding-left: 20px;
  font-size: 12px;
  color: #000;
  display: inline-block;
  white-space: nowrap;
  animation: 10s wordsLoop linear infinite normal;
}

@keyframes wordsLoop {
  0% {
    transform: translateX(200px);
    -webkit-transform: translateX(200px);
  }
  100% {
    transform: translateX(-100%);
    -webkit-transform: translateX(-100%);
  }
}

@-webkit-keyframes wordsLoop {
  0% {
    transform: translateX(200px);
    -webkit-transform: translateX(200px);
  }
  100% {
    transform: translateX(-100%);
    -webkit-transform: translateX(-100%);
  }
}
</style>
