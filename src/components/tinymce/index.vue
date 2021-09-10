<template>
  <div class="tinymce-editor" v-loading="isLoading">
    <editor
      :id="id"
      v-model="myValue"
      :init="init"
      :disabled="disabled"
    ></editor>
  </div>
</template>
<script>
import axios from "axios";
import tinymce from "tinymce";
import Editor from "@tinymce/tinymce-vue";
import "tinymce/themes/silver";
import "tinymce/plugins/paste";
import "tinymce/plugins/image";
import "tinymce/plugins/link";
import "tinymce/plugins/code";
import "tinymce/plugins/table";
import "tinymce/plugins/lists";
import "tinymce/plugins/media";
import "./plugins/axupimgs";
import "./plugins/lineheight";
import "./plugins/indent2em";
import "tinymce/plugins/wordcount";
import "tinymce/icons/default/icons";
import { Loading } from "element-ui";

export default {
  components: {
    Editor
  },
  props: {
    value: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    },
    plugins: {
      type: [String, Array],
      default:
        "link lists image axupimgs media lineheight indent2em code table wordcount paste"
    },
    toolbar: {
      type: [String, Array],
      default:
        "bold italic underline strikethrough | image axupimgs media lineheight indent2em | fontsizeselect fontselect | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent blockquote | undo redo | link unlink code removeformat paste"
    }
  },
  data() {
    return {
      id: "id-" + new Date().getTime(),
      isLoading: false,
      init: {
        language_url:
          window.SITE_CONFIG.cdnUrl + "/static/plugins/tinymce/zh_CN.js", //如果语言包不存在，指定一个语言包路径
        language: "zh_CN", //语言
        skin_url:
          window.SITE_CONFIG.cdnUrl + "/static/plugins/tinymce/skins/ui/oxide", //如果主题不存在，指定一个主题路径
        content_css:
          window.SITE_CONFIG.cdnUrl + "/static/plugins/tinymce/mycontent.css",
        height: "700px",
        width: this.calcWidth,
        plugins: this.plugins, //插件
        toolbar: this.toolbar, //工具栏
        branding: false, //技术支持(Powered by Tiny || 由Tiny驱动)
        menubar: true, //菜单栏
        // theme: "silver", //主题
        zIndex: 110100,
        file_picker_types: "media",
        images_upload_handler: (blobInfo, success, failure) => {
          this.imgUpload(blobInfo, success, failure);
        },
        file_picker_callback: (callback, value, meta) => {
          if (meta.filetype == "media") {
            let input = document.createElement("input"); //创建一个隐藏的input
            input.setAttribute("type", "file");
            let that = this;
            input.onchange = function() {
              let file = this.files[0]; //选取第一个文件
              let instance = axios.create({
                withCredentials: false,
                headers: { "Access-Control-Allow-Origin": "*" }
              }); //withCredentials 禁止携带cookie，带cookie在七牛上有可能出现跨域问题
              let data = new FormData();
              data.append("token", that.QiniuData.mediaToken); //七牛需要的token，叫后台给，是七牛账号密码等组成的hash
              data.append("file", file, file.name);
              instance({
                method: "POST",
                url: that.mediaDomain, //上传地址
                data: data,
                timeout: 300000, //超时时间，因为图片上传有可能需要很久
                onUploadProgress: progressEvent => {
                  //imgLoadPercent 是上传进度，可以用来添加进度条
                  let imgLoadPercent = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                  );
                }
              })
                .then(data => {
                  // 调用成功回调，返回用七牛外链地址和返回的key拼接的图片路径
                  callback(`${that.mediaQiniuaddr}/${data.data.key}`);
                })
                .catch(function(err) {
                  //上传失败
                });
            };
            //触发点击
            input.click();
          }
        }
      },
      myValue: this.value,
      QiniuData: {
        key: "", //图片名字处理
        token: "", //七牛云图片上上传token
        mediaToken: "" // 七牛云视频上传token
      },
      loadingInstance: null,
      domain: "https://up-z1.qiniup.com", // 七牛云的上传地址
      qiniuaddr: "http://file.ccharger.com.cn/", // 七牛云的图片外链地址
      mediaDomain: "https://up-z1.qiniup.com", // 七牛云的上传地址
      mediaQiniuaddr: "http://file.ccharger.com.cn/" // 七牛云的文件外链地址
    };
  },
  mounted() {
    this.getQiniuToken();
    this.getMediaQiniuToken();
    tinymce.init({});
  },
  activated() {
    this.getQiniuToken();
    this.getMediaQiniuToken();
  },
  computed: {
    calcWidth() {
      return document.body.clientWidth / 2 + "px";
    }
  },
  methods: {
    getQiniuToken() {
      this.$http({
        url: this.$http.adornUrl("/pc/v1/qn/token"),
        method: "get"
      })
        .then(res => {
          this.QiniuData.token = res.data.token;
        })
        .catch(error => {});
    },
    getMediaQiniuToken() {
      let _this = this;
      this.$http({
        url: this.$http.adornUrl("/pc/v1/qn/token"),
        method: "get"
      })
        .then(({ data }) => {
          if (data && data.code == 0) {
            this.QiniuData.mediaToken = data.token;
          } else {
            _this.$message.error(data.msg);
          }
        })
        .catch(() => {
          _this.$alert("系统异常，请联系管理员！", "提示");
        });
    },
    imgUpload(blobInfo, success, failure) {
      const axiosInstance = axios.create({
        withCredentials: false,
        headers: { "Access-Control-Allow-Origin": "*" }
      }); //withCredentials 禁止携带cookie，带cookie在七牛上有可能出现跨域问题
      let data = new FormData();
      data.append("token", this.QiniuData.token); //七牛需要的token，叫后台给，是七牛账号密码等组成的hash
      data.append("file", blobInfo.blob());
      axiosInstance({
        method: "POST",
        url: this.domain, //上传地址
        data: data,
        timeout: 30000, //超时时间，因为图片上传有可能需要很久
        onUploadProgress: progressEvent => {
          //imgLoadPercent 是上传进度，可以用来添加进度条
          let imgLoadPercent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
        }
      })
        .then(data => {
          // 调用成功回调，返回用七牛外链地址和返回的key拼接的图片路径
          success(`${this.qiniuaddr}/${data.data.key}`);
        })
        .catch(function(err) {
          //上传失败
        });
    }
  },
  watch: {
    value(newValue) {
      this.myValue = newValue;
    },
    myValue(newValue) {
      this.$emit("input", newValue);
    }
  },
  beforeDestroy: function() {
    tinymce.get(this.id).destroy();
  }
};
</script>
