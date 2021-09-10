<template>
  <div>
    <el-upload
      class="avatar-uploader"
      action=""
      :show-file-list="false"
      :on-change="handleChange"
      :http-request="handleRequest"
    >
      <img v-if="childImgUrl" :src="childImgUrl" class="avatar" />
      <i v-else class="el-icon-plus avatar-uploader-icon"></i>
    </el-upload>
  </div>
</template>
<script>
// 图片前缀 https://starking-1253858505.cos.ap-
import COS from "cos-js-sdk-v5";
import axios from "axios";
export default {
  data() {
    return {
      fileObj: null,
      childImgUrl: ""
    };
  },
  props: {
    parentImgUrl: String
  },
  model: {
    prop: "parentImgUrl",
    event: "uploadFile"
  },
  watch: {
    parentImgUrl(newVal) {
      if (this.childImgUrl !== newVal) {
        this.childImgUrl = newVal;
      }
    }
  },
  methods: {
    handleRequest() {
      let self = this;
      let fileObj = this.fileObj;
      var blobFile = this.$options.methods.dataURLtoBlob.bind(this)(fileObj);
      var filename = fileObj.name;
      var cos = new COS({
        SecretId: "AKIDJxLTKxhYWleHVVnFxOaWEjxhjW4M8feM",
        SecretKey: "b2AwSTsBgxxiE9vRggQvc3D7lqhhbHhs"
      });
      cos.putObject(
        {
          Bucket: "starking-1253858505",
          Region: "ap-shanghai",
          Key: filename,
          StorageClass: "STANDARD",
          Body: blobFile, // 上传文件对象
          onProgress: function(progressData) {
            console.log("sucess", JSON.stringify(progressData));
          }
        },
        function(err, data) {
          console.log("err", err || data);
          console.log("data", data.Location);

          self.childImgUrl = "http://" + data.Location;
          self.$emit("uploadFile", "http://" + data.Location);
        }
      );
    },
    handleChange(file, fileList) {
      this.fileObj = file.raw;
    },
    //DataURL转Blob
    dataURLtoBlob(fileObj) {
      console.log("size", fileObj.size);
      return new Blob([fileObj], { type: fileObj.type });
    }
  }
};
</script>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
