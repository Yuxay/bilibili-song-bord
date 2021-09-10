<template>
  <div>
    <el-upload
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      action="https://jsonplaceholder.typicode.com/posts/"
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
  props: {
    // parentVal: String,
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
        let arr = this.childImgArr;
        let str = "";
        if (!this.isEmpty(arr)) {
          str = arr.join(" ");
        }
        if (str !== val) {
          let valArr = val.split(" ");
          this.fileList = valArr.map(item => {
            return {
              name: item,
              url: item
            };
          });
        }
      }
    },
    imgObj: function() {
      let arr = this.imgObj;
      let tempArr = [];
      if (!this.isEmpty(arr)) {
        arr.forEach(item => {
          tempArr.push(item.url);
        });
      }
      console.log(tempArr);
      this.$emit("change", tempArr);
    }
  },
  data() {
    return {
      isLoading: false,
      fileList: [],
      parentVal:
        "https://tse4-mm.cn.bing.net/th/id/OIP.uPx-FbZ4nf2U05kCoJ7_1QHaE8?w=262&h=180&c=7&o=5&pid=1.7 https://tse1-mm.cn.bing.net/th/id/OIP.tXLPDc_5P-E7ca-KtD_UVAHaEK?w=311&h=180&c=7&o=5&pid=1.7 https://tse3-mm.cn.bing.net/th/id/OIP.XHR0ESekKzxVDwpuzYIJagHaEo?w=280&h=180&c=7&o=5&pid=1.7",
      dialogImageUrl: "",
      dialogVisible: false,
      imgObj: [] // 完整的图片数据数组
    };
  },
  methods: {
    handleRemove(file, fileList) {
      console.log(file, fileList);
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
      // this.QiniuData.key = `upload_pic_${timestamp}.${suffix}`;
    },
    uploadSuccess(response, file, fileList) {
      // console.log(response)
      // console.log(file)
      // console.log(fileList)
      this.isLoading = false;
      this.imgObj = fileList;
      // `${this.qiniuaddr}/${response.key}`
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
.tip_str {
  font-size: 14px;
  color: #606266;
  margin-top: 7px;
}
</style>
