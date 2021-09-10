<template>
  <div class="bili-bg" :style="{ width: width + 'vw' }">
    <div
      class="van-cell"
      :style="{ width: width + 'vw' }"
      style="
        position: fixed;
        top: 0;
        height: 40px;
        word-break: break-all;
        white-space: pre-wrap;
      "
    >
      <span
        style="width: 30%; margin-right: 15px; opacity: 0.5; text-align: left"
        >用户</span
      >
      <span style="width: 40%; margin-right: 15px; text-align: left">歌名</span>
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
            <div
              v-if="!isMobile"
              class="del-btn"
              @click="delHandle(item, index)"
            >
              删除
            </div>
          </div>
        </div>
        <template #right>
          <van-button
            square
            type="danger"
            text="删除"
            @click="delHandle(item, index)"
          />
        </template>
      </van-swipe-cell>
    </div>
  </div>
</template>
<script>
import pako from "pako";
export default {
  data() {
    return {
      isMobile: false,
      timer: null,
      width: 100,
      songArr: []
    };
  },
  mounted() {
    clearTimeout(this.timer);
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
    let _this = this;
    _this.timer = setTimeout(() => {
      _this.init();
    }, 100);
  },
  methods: {
    delHandle(item, index) {
      this.songArr.splice(index, 1);
      this.clickDel(item.id);
    },
    init() {
      var room_id = 22887106; //上面获取到的room_id 可儿
      var json = {
        uid: 0,
        roomid: room_id, //上面获取到的room_id
        protover: 1,
        platform: "web",
        clientver: "1.4.0"
      };
      console.log(this.$socket);
      this.$socket.emit("connect", json); //触发socket连接
      //   this.websocketInit();
      //   this.initDB();
      //   this.getList()
    },
    websocketInit() {},
    initDB() {
      let request = indexedDB.open("myDB");

      // err
      request.onerror = event => {
        console.log("数据库打开/创建报错", event);
      };

      //如果指定的版本号，大于数据库的实际版本号，就会发生数据库升级事件upgradeneeded。
      //升级后自动触发success
      request.onupgradeneeded = event => {
        let db = event.target.result;
        this.db = db;
        //建表 名为person,主键为id
        let store = db.createObjectStore("song", {
          keyPath: "id"
        });
        //新建索引名称、索引所在的属性、配置对象（说明该属性是否允许有重复的值）
        store.createIndex("name", "name", {
          unique: false
        });
        store.createIndex("age", "age", {
          unique: false
        });
        store.createIndex("time", "time", {
          unique: false
        });

        console.log("数据库升级");
      };

      // success
      request.onsuccess = event => {
        this.db = event.target.result;
        console.log("数据库打开/创建成功", event);
        this.getList();
      };
    },
    clickAdd(obj) {
      // 建立读写事务,向对象仓库写入数据记录
      let request = this.db
        .transaction(["song"], "readwrite")
        .objectStore("song")
        .add(obj);
      request.onsuccess = event => {
        this.$notify({ title: "点歌成功", duration: 1000 });
        this.song = {};
        // 获取数据列表
        this.getList();
      };

      request.onerror = event => {
        console.error(event);
        this.$notify({ title: "重复数据写入失败", duration: 1000 });
      };
    },
    read() {
      var transaction = this.db.transaction(["song"]);
      let objectStore = transaction.objectStore("song");
      let request = objectStore.get(3);

      request.onerror = function(event) {
        console.log("获取列表失败");
      };

      request.onsuccess = function(event) {
        if (request.result) {
          console.log("Name: " + request.result.name);
          console.log("user: " + request.result.user);
          console.log("Time: " + request.result.time);
        } else {
          console.log("未获得数据记录");
        }
      };
    },
    getList() {
      var transaction = this.db.transaction(["song"]);
      let objectStore = transaction.objectStore("song");
      let list = [];
      // 遍历数据库
      objectStore.openCursor().onsuccess = event => {
        console.log(event);
        let cursor = event.target.result;
        if (cursor) {
          list.push(cursor.value);
          cursor.continue();
        } else {
          this.songArr = list;
          console.log(list);
        }
      };
    },
    clickDel(id) {
      var request = this.db
        .transaction(["song"], "readwrite")
        .objectStore("song")
        .delete(id);

      request.onsuccess = event => {
        this.$notify({ title: "删除成功", duration: 1000 });
        this.getList();
      };

      request.onerror = event => {
        this.$notify({ title: "删除失败", duration: 1000 });
      };
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
    },
    //组合认证数据包
    getCertification(json) {
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
