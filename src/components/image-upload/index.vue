<template>
  <div>
    <el-upload
      :disabled="isEdit"
      v-loading="isLoading"
      :action="domain"
      :data="QiniuData"
      :on-remove="handleRemove"
      :on-error="uploadError"
      :on-success="uploadSuccess"
      :before-remove="beforeRemove"
      :before-upload="beforeUpload"
      :show-file-list="false"
    >
      <img
        :class="
          postersVal ? 'postersImg' : scaleRes ? 'squareImg' : 'rectangleImg'
        "
        v-if="childImgUrl"
        :src="childImgUrl"
        alt
      />
      <i
        v-else
        class="el-icon-plus"
        :class="
          postersVal ? 'postersImg' : scaleRes ? 'squareImg' : 'rectangleImg'
        "
      ></i>
    </el-upload>
    <!-- <div class="tip_str">
      {{ tipVal }}
    </div> -->
    <el-alert
      style="margin-top:15px"
      id="tip-alert"
      :title="tipVal"
      type="warning"
      :closable="false"
    >
    </el-alert>
    <!-- <div style="margin-top:10px">
      <el-input v-model="childImgUrl" placeholder=""></el-input>
    </div> -->
    <div v-if="inputVisible" style="margin-top:10px">
      <el-input
        :disabled="isEdit"
        v-model="childImgUrl"
        placeholder=""
      ></el-input>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    parentImg: String,
    isSquare: {
      type: Boolean,
      default: false
    },
    isPosters: {
      type: Boolean,
      default: false
    },
    // 提示语文字
    tipStr: {
      type: String,
      default: "只能上传jpg/png文件，且不超过2MB"
    },
    // 限制图片大小
    imgSize: {
      type: Number,
      default: 2
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    postersVal() {
      let boolean = this.isPosters;
      return boolean;
    },
    scaleRes() {
      let boolean = this.isSquare;
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
    },
    // 是否禁用
    isEdit() {
      let boolean = this.disabled;
      return boolean
    }
  },
  model: {
    prop: "parentImg",
    event: "passImg"
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
    // parentImg(newVal) {
    //   if (this.childImgUrl !== newVal) {
    //     this.childImgUrl = newVal;
    //   }
    // },
    childImgUrl() {
      this.$emit("passImg", this.childImgUrl);
    }
  },
  data() {
    return {
      isLoading: false,
      childImgUrl: "",
      inputVisible: false,
      QiniuData: {
        key: "", //图片名字处理
        token: "" //七牛云token
      },
      domain: "https://up-z1.qiniup.com", // 七牛云的上传地址
      qiniuaddr: "http://file.ccharger.com.cn/" // 七牛云的图片外链地址
    };
  },
  mounted() {
    if (process.env.NODE_ENV !== "production") {
      this.inputVisible = true;
    } else {
      this.inputVisible = false;
    }
    this.getQiniuToken();
  },
  activated() {
    if (process.env.NODE_ENV !== "production") {
      this.inputVisible = true;
    } else {
      this.inputVisible = false;
    }
    this.getQiniuToken();
  },
  methods: {
    handleRemove(file, fileList) {
      this.childImgUrl = "";
    },
    beforeUpload(file) {
      this.isLoading = true;
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
      }

      var index1 = file.name.lastIndexOf(".");
      var index2 = file.name.length;
      var suffix = file.name.substring(index1 + 1, index2);
      //时间戳
      var timestamp = Date.parse(new Date());
      this.QiniuData.key = `upload_pic_${timestamp}.${suffix}`;
    },
    uploadSuccess(response, file, fileList) {
      this.isLoading = false;
      this.childImgUrl = `${this.qiniuaddr}/${response.key}`;
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
        url: this.$http.adornUrl("/pc/v1/qn/token"),
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
.el-icon-plus {
  border: 1px dashed #d9d9d9;
}
.squareImg {
  width: 180px !important;
  height: 180px !important;
  line-height: 180px !important;
  margin: 0 auto;
}
.rectangleImg {
  width: 240px !important;
  height: 180px !important;
  line-height: 180px !important;
  margin: 0 auto;
}
.postersImg {
  width: 135px !important;
  height: 240px !important;
  line-height: 240px !important;
  margin: 0 auto;
}
</style>
