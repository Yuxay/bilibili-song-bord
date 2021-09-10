<template>
  <div @click="aaa">
    <div
      class="weekImg"
      v-for="(e,index) in numList"
      :key="index"
    >
      <div class="weekTitle">{{e}}</div>
      <div>
        <!-- 新增 -->
        <div v-if="id == 0">
          <el-upload
            class="avatar-uploader"
            :action="domain"
            :data="QiniuData"
            :on-remove="handleRemove"
            :on-error="uploadError"
            :on-success="(res)=>{ return uploadSuccess(res, index)}"
            :before-remove="beforeRemove"
            :before-upload="beforeUpload"
            :on-exceed="handleExceed"
            :show-file-list="false"
          >
            <div
              class="bg-img"
              v-if="images[index]"
            >
              <img :src="images[index]" />
            </div>
            <i
              v-else
              class="el-icon-plus avatar-uploader-icon"
            ></i>
          </el-upload>
        </div>
        <!-- 修改 -->
        <div
          class="bg-img"
          v-else
        >
          <img
            v-if="images[index]"
            :src="images[index]"
            @click="openModify(index)"
          />
          <div v-else>
            <el-upload
              class="avatar-uploader"
              :action="domain"
              :data="QiniuData"
              :on-remove="handleRemove"
              :on-error="uploadError"
              :on-success="(res)=>{ return uploadSuccess(res, index)}"
              :before-remove="beforeRemove"
              :before-upload="beforeUpload"
              :on-exceed="handleExceed"
              :show-file-list="false"
            >
              <div
                class="bg-img"
                v-if="images[index]"
              >
                <img :src="images[index]" />
              </div>
              <i
                v-else
                class="el-icon-plus avatar-uploader-icon"
              ></i>
            </el-upload>
          </div>
        </div>
      </div>
      <div class="bg-inputWrap">
        <el-input
          @change="changeImg(index)"
          v-model="imgValue[index]"
        ></el-input>
      </div>
    </div>
    <el-dialog :lock-scroll="false"
      :modal="false"
      :visible.sync="shareVisible"
      title="修改图片"
    >
      <div :class="isImgRectangle ? 'rectangleImg' : 'squareImg'">
        <img
          style="width:100%;height:100%"
          :src="images[modifyIndex]"
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
          :on-success="(res)=>{ return uploadSuccess(res, modifyIndex)}"
          :before-remove="beforeRemove"
          :before-upload="beforeUpload"
          :on-exceed="handleExceed"
          :show-file-list="false"
        >
          <el-button>上传图片</el-button>
        </el-upload>
        <!-- <el-button
          type="primary"
          @click="shareVisible=false"
        >确定</el-button> -->
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  props: {
    id: { type: Number },
    parentImages: { type: String },
    parentimgValue: { type: String },
    imgTotal: { type: Number, default: 4 },
    isImgRectangle: { type: Boolean, default: true }
  },
  data() {
    return {
      shareVisible: false,
      modifyIndex: 0,
      images: [], //图片数组
      imgValue: [], //输入框数组
      numList: [],
      QiniuData: {
        key: "", //图片名字处理
        token: "" //七牛云token
      },
      domain: "http://upload.qiniup.com", // 七牛云的上传地址
      qiniuaddr: "http://img.bbs.effchat.com" // 七牛云的图片外链地址
    };
  },
  created() {
    if (this.id === 1) {
      this.images = this.parentImages.split(" ");
      this.imgValue = this.parentimgValue.split(" ");
    }
    if (this.imgTotal) {
      for (let i = 0; i < this.imgTotal; i++) {
        this.numList.push(`第${i + 1}张`);
      }
    }
    this.getQiniuToken();
  },
  methods: {
    aaa(){
      console.log('imags',this.images)
    },
    // 通过输入框修改图片
    changeImg(index) {
      this.$set(this.images, index, this.imgValue[index]);
      let str = this.images.join(" ");
      this.$emit("moreImages", str);
    },
    // 打开修改图片弹窗，传递图片下标
    openModify(index) {
      this.shareVisible = true;
      this.modifyIndex = index;
    },
    handleRemove(file, fileList) {
      // 注释此段，防止出错时清空数据
      // this.images = [];
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
      let self = this;

      if (!isPNG && !isJPEG && !isJPG) {
        this.$message.error("上传图片只能是 jpg、png、jpeg 格式!");
        return false;
      }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 2MB!");
        return false;
      }

      var index1 = file.name.lastIndexOf(".");
      //   var index2 = file.name.length;
      var index2 = file.name;
      var suffix = file.name.substring(index1 + 1, index2);
      //时间戳
      var timestamp = Date.parse(new Date());
      this.QiniuData.key = `upload_pic_${timestamp}.${suffix}`;
    },
    uploadSuccess(response, index) {
      this.$set(this.images, index, `${this.qiniuaddr}/${response.key}`);
      this.$set(this.imgValue, index, `${this.qiniuaddr}/${response.key}`);
      let str = this.images.join(" ");
      this.$emit("moreImages", str);
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
        url: this.$http.adornUrl("lesson/file/qiniu-token"),
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
.weekTitle {
  text-align: center;
  font-size: 18px;
}
.weekImg {
  display: inline-block;
  margin-right: 15px;
}
.bg-inputWrap {
  margin: 10px 0;
}
.avatar-uploader-icon {
  height: 180px !important;
  line-height: 180px !important;
}
.el-input {
  width: 500px;
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