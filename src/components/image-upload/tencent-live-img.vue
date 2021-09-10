<template>
  <div v-loading="isLoading">
    <!-- <el-upload
      class="upload-demo"
      action=""
      :on-change="handleChange"
      :http-request="vertifyImgsize"
      :multiple="false"
      :limit="1"
      :on-exceed="handleExceed"
    >
      <el-button size="small" type="primary">点击上传</el-button>
      <div slot="tip" class="el-upload__tip">
        {{ tipVal }}
      </div>
    </el-upload> -->
    <el-upload
      class="avatar-uploader"
      action=""
      :on-change="handleChange"
      :http-request="vertifyImgsize"
      :multiple="false"
      :limit="1"
      :on-exceed="handleExceed"
    >
      <img
        :class="scaleRes ? 'coverImg' : 'faceImg'"
        v-if="childImgUrl"
        :src="childImgUrl"
        alt
      />
      <i
        v-else
        class="el-icon-plus"
        :class="scaleRes ? 'coverImg' : 'faceImg'"
      ></i>
    </el-upload>
    <div class="tip_str">
      {{ tipVal }}
    </div>
    <!-- <div style="margin-top:10px">
      <el-input v-model="childImgUrl" placeholder=""></el-input>
    </div> -->
  </div>
</template>
<script>
import axios from "axios";
import Vue from "vue";
var instance = axios.create({
  // baseURL:"https://api.weixin.qq.com/",
  timeout: 100000,
  // headers: { "Content-Type": "application/json" }
  headers: { "token":Vue.cookie.get('token') }
});
export default {
  props: {
    parentImg: String,
    isCoverImg: {
      type: Boolean,
      default: false
    },
    // 提示语文字
    tipStr: {
      type: String,
      default: ""
    },
    // 限制图片大小
    imgSize: {
      type: Number,
      default: 2
    }
  },
  computed: {
    scaleRes() {
      let boolean = this.isCoverImg;
      return boolean;
    },
    // 提示语文字
    tipVal() {
      let str = this.tipStr;
      return str;
    },
    // 限制图片大小
    exceedSize() {
      let num = this.imgSize;
      return num;
    }
  },
  watch: {
    parentImg: {
      immediate: true,
      handler: function(newVal) {
        if (this.childImgUrl !== newVal) {
          this.childImgUrl = newVal;
        }
      }
    },
    childImgUrl() {
      this.$emit("passImgUrl", this.childImgUrl);
    },
    childMediaId() {
      this.$emit("passMediaId", this.childMediaId);
    }
  },
  data() {
    return {
      isLoading: false,
      fileObj: null,
      blobFile: null,
      childImgUrl: "",
      innerVisible: false,
      fileList: [],
      accessToken: "", // 上传需要的token
      QiniuData: {
        key: "", //图片名字处理
        token: "" //七牛云token
      },
      domain: "https://up-z1.qiniup.com", // 七牛云的上传地址
      qiniuaddr: "https://img.starkingdream.com" // 七牛云的图片外链地址
    };
  },
  mounted() {
    // this.getAccessToken();
    // this.getQiniuToken();
  },
  activated() {
    // this.getAccessToken();
    // this.getQiniuToken();
  },
  methods: {
    //DataURL转Blob
    dataURLtoBlob(fileObj) {
      console.log("size", fileObj.size);
      return new Blob([fileObj], { type: fileObj.type });
    },
    vertifyImgsize() {
      let file = this.fileObj;
      const isPNG = file.type === "image/png";
      const isJPEG = file.type === "image/jpeg";
      const isJPG = file.type === "image/jpg";
      // const isLt2M = file.size / 1024 / 1024 < 2;
      const isLt2M = file.size < this.exceedSize * 1024 * 1024;

      if (!isPNG && !isJPEG && !isJPG) {
        this.$message.error("上传图片只能是 jpg、png、jpeg 格式!");
        return false;
      }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 " + this.exceedSize + "MB!");
        return false;
      } else {
        this.handleTempUpload();
        // this.handleQiniuUpload();
        // this.handleRequest();
      }
    },
    /**
     * 上传图片至后台进行二次上传，获取图片的 url 和 media_id
     */
    handleTempUpload() {
      let fileObj = this.fileObj;
      console.log(fileObj);
      var formdata = new FormData();
      formdata.append("file", fileObj);
      instance({
        // url: `/proxyApi/starking/liveroom/get-media`, // 本地测试使用
        url: `/training/starking/liveroom/get-media`, // 线上使用
        method: "post",
        // data: { file: formdata }
        data: formdata
      }).then(({ data }) => {
        if (data && data.code === 0) {
          let obj = data.media;
          // 七牛数据
          this.childImgUrl = obj.qiniu;
          this.$emit("passImgUrl", this.childImgUrl);
          // 腾讯数据
          let tencentObj = JSON.parse(obj.media)
          this.childMediaId = tencentObj.media_id;
          this.$emit("passMediaId", this.childMediaId);
          console.log(this.childMediaId);
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    /**
     * 已废弃
     * 调用微信的上传临时素材接口，上传图片至素材库
     */
    async handleRequest() {
      this.isLoading = true;
      let self = this;
      let fileObj = this.fileObj;
      console.log(fileObj);
      var formdata = new FormData();
      formdata.append("media", fileObj);
      instance({
        method: "post",
        url:
          "https://api.weixin.qq.com/cgi-bin/media/upload?access_token=" +
          this.accessToken +
          "&type=image",
        data: formdata
      }).then(({ data }) => {
        this.isLoading = false;
        this.childMediaId = data.media_id;
        this.$emit("passMediaId", data["media_id"]);
        console.log(data);
      });
    },
    handleChange(file, fileList) {
      this.fileObj = file.raw;
    },
    handleExceed(files, fileList) {
      // this.$message.warning(
      //   `当前限制选择 1 个文件，本次选择了 ${
      //     files.length
      //   } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      // );
      this.fileList = [];
    },
    /**
     * 已废弃
     * 上传图片到七牛云
     */
    handleQiniuUpload() {
      let file = this.fileObj;
      const axiosInstance = axios.create({ withCredentials: false }); //withCredentials 禁止携带cookie，带cookie在七牛上有可能出现跨域问题
      let data = new FormData();
      data.append("token", this.QiniuData.token); //七牛需要的token，叫后台给，是七牛账号密码等组成的hash
      data.append("file", file);
      axiosInstance({
        method: "POST",
        url: "https://up-z1.qiniup.com", //上传地址
        data: data,
        timeout: 30000, //超时时间，因为图片上传有可能需要很久
        onUploadProgress: progressEvent => {
          //imgLoadPercent 是上传进度，可以用来添加进度条
          let imgLoadPercent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
        }
      })
        .then(({ data }) => {
          // debugger
          console.log("qiniudata", data);
          this.childImgUrl = `${this.qiniuaddr}/${data.key}`;
          console.log("childImgUrl", this.childImgUrl);
          this.$emit("passImgUrl", this.childImgUrl);
        })
        .catch(function(err) {
          //上传失败
        });
    },
    /**
     * 已废弃
     * 获取腾讯的token
     */
    getAccessToken() {
      this.$http({
        url: this.$http.adornUrl("/starking/liveroom/access-token"),
        method: "post"
      })
        .then(res => {
          this.accessToken = res.data["access-token"];
          // console.log("res", this.accessToken);
        })
        .catch(error => {});
    },
    /**
     * 已废弃
     * 获取七牛的token
     */
    getQiniuToken() {
      this.$http({
        url: this.$http.adornUrl("/api/file/qiniu-token-img"),
        method: "get"
      })
        .then(res => {
          this.QiniuData.token = res.data.token;
        })
        .catch(error => {});
    }
  }
};
</script>
<style lang="scss" scoped>
.faceImg {
  width: 200px !important;
  height: 160px !important;
  line-height: 160px !important;
  margin: 0 auto;
}
.coverImg {
  width: 135px !important;
  height: 240px !important;
  line-height: 240px !important;
  margin: 0 auto;
}
</style>
