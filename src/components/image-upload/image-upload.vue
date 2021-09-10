<template>
  <div>
    <!-- 新增 -->
    <div
      v-if="!id"
      class="imgList-uploader"
    >
      <el-upload
        class="avatar-uploader"
        :action="domain"
        :data="QiniuData"
        :on-remove="handleRemove"
        :on-error="uploadError"
        :on-success="uploadSuccess"
        :before-remove="beforeRemove"
        :before-upload="beforeUpload"
        :on-exceed="handleExceed"
        :show-file-list="false"
      >
        <img
          v-if="image"
          :src="image"
          alt
        />
        <i
          v-else
          class="el-icon-plus avatar-uploader-icon"
        ></i>
      </el-upload>
    </div>
    <!-- 修改 -->
    <div
      class="form-img"
      v-else
    >
      <!-- 有图的修改 -->
      <img
        v-if="image && image.length>0"
        :src="image"
        @click="innerVisible = true"
      />
      <!-- 无图的修改 -->
      <div
        v-else
        class="imgList-uploader"
      >
        <el-upload
          class="avatar-uploader"
          :action="domain"
          :data="QiniuData"
          :on-remove="handleRemove"
          :on-error="uploadError"
          :on-success="uploadSuccess"
          :before-remove="beforeRemove"
          :before-upload="beforeUpload"
          :on-exceed="handleExceed"
          :show-file-list="false"
        >
          <img
            v-if="image"
            :src="image"
            alt
          />
          <i
            v-else
            class="el-icon-plus avatar-uploader-icon"
          ></i>
        </el-upload>
      </div>
    </div>
    <el-input
      class="bg-inputWrap"
      v-model="image"
      @change="handleInputChange"
    ></el-input>
    <!-- 修改图片弹窗 -->
    <el-dialog :lock-scroll="false"
      append-to-body
      :visible.sync="innerVisible"
      title="修改图片"
    >
      <div :class="isImgRectangle ? 'rectangleImg' : 'squareImg'">
        <img
          style="width:100%;height:100%;"
          :src="image"
        />
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-upload
          style="display:inline-block;vertical-align:middle"
          :action="domain"
          :data="QiniuData"
          :on-remove="handleRemove"
          :on-error="uploadError"
          :on-success="uploadSuccess"
          :before-remove="beforeRemove"
          :before-upload="beforeUpload"
          :on-exceed="handleExceed"
          :show-file-list="false"
        >
          <el-button>上传图片</el-button>
        </el-upload>
        <el-button
          style="margin-left:10px"
          type="primary"
          @click="innerVisible = false"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  props: {
    id: { type: Number },
    parentImage: { type: String },
    isImgRectangle: { type: Boolean, default: true }
  },
  data() {
    return {
      image: "",
      innerVisible: false,
      QiniuData: {
        key: "", //图片名字处理
        token: "" //七牛云token
      },
      domain: "http://up-z2.qiniup.com", // 七牛云的上传地址
      qiniuaddr: "http://file.starkingdream.com" // 七牛云的图片外链地址
    };
  },
  created() {
    if (this.id == 1) {
      this.image = this.parentImage;
    } else {
      this.image = "";
    }
    this.getQiniuToken();
  },
  methods: {
    handleInputChange(val) {
      this.$emit("oneImage", val);
    },
    handleRemove(file, fileList) {
      this.image = "";
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 1 张图片，如需更换，请删除上一张图片在重新选择！`
      );
    },
    beforeUpload(file) {
      const isPNG = file.type === "image/png";
      const isJPEG = file.type === "image/jpeg";
      const isJPG = file.type === "image/jpg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isPNG && !isJPEG && !isJPG) {
        this.$message.error("上传图片只能是 jpg、png、jpeg 格式!");
        return false;
      }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 2MB!");
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
      this.image = `${this.qiniuaddr}/${response.key}`;
      this.$emit("oneImage", this.image);
    },
    uploadError(err, file, fileList) {
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
.avatar-uploader-icon {
  width: 180px !important;
  height: 180px !important;
  line-height: 180px !important;
}
.squareImg {
  width: 360px;
  height: 360px;
  margin: 0 auto;
}
.rectangleImg {
  width: 640px;
  height: 360px;
  margin: 0 auto;
}
</style>