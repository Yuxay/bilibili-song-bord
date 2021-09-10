<template>
  <div class="more-img-wrap">
    <el-upload
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :action="domain"
      :data="QiniuData"
      :on-error="uploadError"
      :on-success="uploadSuccess"
      :before-upload="beforeUpload"
      :limit="limit"
      :disabled="disabled"
      :on-exceed="handleExceed"
      :file-list="fileList"
    >
      <i v-loading="isLoading" class="el-icon-plus"></i>
    </el-upload>
    <div class="tip_str">
      {{ tipVal }}
    </div>
    <el-dialog :lock-scroll="false" :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "MoreImageUploadMini",
  props: {
    parentVal: Array,
    // 提示语文字
    tipStr: {
      type: String,
      default: "只能上传jpg/png文件，且单个不超过15KB"
    },
    // 图片上传数量
    limitNum: {
      type: Number,
      default: 5
    },
    // 限制图片大小
    imgSize: {
      type: Number,
      default: 2
    },
    // 是否禁用
    isDisabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
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
    // 图片上传数量
    limit() {
      let num = this.limitNum;
      return num;
    },
    // 是否禁用
    disabled() {
      let bool = this.isDisabled;
      return bool;
    }
  },
  model: {
    prop: "parentVal",
    event: "change"
  },
  watch: {
    parentVal: {
      immediate: true,
      handler: function(val, oldVal) {
        let _this = this;
        if (!this.isEmpty(val)) {
          val.forEach(item => {
            let obj = {};
            obj.name = item.id;
            obj.url = item.imageUrl;
            _this.fileList.push(obj);
          });
        }
      }
    },
    childImgArr: function() {
      console.log(this.childImgArr)
      this.$emit("change", this.childImgArr);
    }
  },
  data() {
    return {
      isLoading: false,
      fileList: [],
      childImgArr: [],
      dialogImageUrl: "",
      dialogVisible: false,
      imgObj: [], // 完整的图片数据数组
      QiniuData: {
        key: "", //图片名字处理
        token: "" //七牛云token
      },
      domain: "https://up-z1.qiniup.com", // 七牛云的上传地址
      qiniuaddr: "http://file.ccharger.com.cn/" // 七牛云的图片外链地址
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
      let id = file.name;
      // this.$http({
      //   url: this.$http.adornUrl("/pc/v1/img/delete"),
      //   method: "post",
      //   data: this.$http.adornData([id], false)
      // }).then(({ data }) => {
      //   if (data && data.code == 0) {
      //   }
      // });
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    beforeUpload(file) {
      this.isLoading = true;
      const isPNG = file.type === "image/png";
      const isJPEG = file.type === "image/jpeg";
      const isJPG = file.type === "image/jpg";
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
      let imgUrl = `${this.qiniuaddr}/${response.key}`;
      let arr = this.childImgArr.concat();
      arr.push(imgUrl);
      arr = this.unique(arr);
      this.childImgArr = arr;
    },
    handleExceed(file, fileList) {
      this.isLoading = false;
      this.$message({
        message: "已达到最大上传数量",
        type: "warning",
        center: true
      });
    },
    uploadError(err, file, fileList) {
      this.isLoading = false;
      console.error(err);
      this.$message({
        message: "上传出错，请重试！",
        type: "error",
        center: true
      });
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
<style lang="scss">
.tip_str {
  font-size: 14px;
  color: #606266;
  margin-top: 7px;
}
</style>
