<template>
  <div v-loading="isLoading">
    <video
      v-if="childFileUrl"
      class="rectangleImg"
      controls="controls"
      :src="childFileUrl"
    >
      您的浏览器不支持 video 标签。
    </video>
    <div v-else>暂无视频</div>
    <el-upload
      class="upload-demo"
      :action="domain"
      :data="QiniuData"
      :on-remove="handleRemove"
      :on-error="uploadError"
      :on-success="uploadSuccess"
      :before-remove="beforeRemove"
      :before-upload="beforeUpload"
      :show-file-list="false"
    >
      <el-button size="small" type="primary">点击上传</el-button>
      <div slot="tip" class="el-upload__tip">
        视频大小不能超过{{ fileSize }}MB
      </div>
    </el-upload>
    <!-- <div style="margin-top:10px">
      <el-input v-model="childFileUrl" placeholder=""></el-input>
    </div> -->
  </div>
</template>
<script>
export default {
  props: {
    parentFile: String,
    // 提示语文字
    tipStr: {
      type: String,
      default: "文件大小不能超过2MB"
    },
    // 限制文件大小
    fileSize: {
      type: Number,
      default: 500
    }
  },
  computed: {
    // 提示语文字
    tipVal() {
      let str = this.tipStr;
      return str;
    },
    // 限制文件大小
    exceedSize() {
      let num = this.fileSize;
      return num;
    }
  },
  model: {
    prop: "parentFile",
    event: "passFile"
  },
  watch: {
    parentFile: {
      immediate: true,
      handler: function(newVal) {
        if (this.childFileUrl !== newVal) {
          this.childFileUrl = newVal;
        }
      }
    },
    childFileUrl() {
      this.$emit("passFile", this.childFileUrl);
    }
  },
  data() {
    return {
      isLoading: false,
      childFileUrl: "",
      innerVisible: false,
      QiniuData: {
        key: "", //文件名字处理
        token: "" //七牛云token
      },
      domain: "https://up-z2.qiniup.com", // 七牛云的上传地址
      // qiniuaddr: "http://file.starkingdream.com" // 七牛云的文件外链地址
      qiniuaddr: "https://video.starkingdream.com" // 七牛云的文件外链地址
    };
  },
  mounted() {
    this.getQiniuToken();
  },
  activated() {
    this.getQiniuToken();
  },
  methods: {
    handleRemove(file, fileList) {
      this.childFileUrl = "";
    },
    beforeUpload(file) {
      this.isLoading = true;
      //   const isPNG = file.type === "image/png";
      //   const isJPEG = file.type === "image/jpeg";
      //   const isJPG = file.type === "image/jpg";
      // const isLt2M = file.size / 1024 / 1024 < 2;
      const isLt2M = file.size < this.exceedSize * 1024 * 1024;

      //   if (!isPNG && !isJPEG && !isJPG) {
      //     this.$message.error("上传文件只能是 jpg、png、jpeg 格式!");
      //     return false;
      //   }
      if (!isLt2M) {
        this.$message.error("上传视频大小不能超过 " + this.exceedSize + "MB!");
        return false;
      }

      var index1 = file.name.lastIndexOf(".");
      var index2 = file.name.length;
      var suffix = file.name.substring(index1 + 1, index2);
      //时间戳
      var timestamp = Date.parse(new Date());
      this.QiniuData.key = `upload_pic_${timestamp}.${suffix}`;
    },
    uploadSuccess(response, file, fileList) {
      this.childFileUrl = `${this.qiniuaddr}/${response.key}`;
      this.isLoading = false;
    },
    uploadError(err, file, fileList) {
      this.isLoading = false;
      this.$message({
        message: "上传出错，请重试！",
        type: "error",
        center: true
      });
    },
    beforeRemove(file, fileList) {
      // return this.$confirm(`确定移除 ${ file.name }？`);
    },
    getQiniuToken() {
      this.$http({
        url: this.$http.adornUrl("/api/file/qiniu-token-video"),
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
.squareImg {
  width: 180px !important;
  height: 180px !important;
  line-height: 180px !important;
  margin: 0 auto;
}
.rectangleImg {
  width: 320px !important;
  height: 180px !important;
  line-height: 180px !important;
  margin: 0 auto;
}
</style>
