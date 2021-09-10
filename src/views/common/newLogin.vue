<template>
  <div class="site-wrapper site-page--login">
    <div class="site-content__wrapper">
      <div class="site-content">
        <!-- <div class="login-title">
          <img :src="staticImgSrc" alt />
          <span class="login-title-txt">名片</span>
        </div> -->
        <el-row v-loading="isLoading" class="login_box" :sapn="24">
          <el-col class="box_intro" :span="12">
            <!-- <div class="intro_tit">名片</div>
            <div class="intro_tit_jr">乐音至臻，德艺双馨</div>
            <div class="intro_author_wrap">
              <div class="intro_author_cont">
                <div class="author_cont_name">马云 阿里巴巴创始人</div>
                <div class="author_cont_cont">很多人不能明白未来对自己的意义和机会，也很难理解坚持对自己未来的意义，但我们必须明白未来一定会有人因为你的想法而成功。很多人只是想了一想而已，而有的人却是在真正的坚持的做。</div>
              </div>
            </div>
            <div class="intro_footer">
              <span class="footer_tit">名片</span>
              <span class="fotter_divider">·</span>
              <span class="footer_cont">教育机构点评专家</span>
            </div> -->
          </el-col>
          <el-col class="box_form" :span="12">
            <div class="box_form_container">
              <div class="box_form_header">
                <span class="form_headr_tit">冲充电站</span>
              </div>
              <div class="form_input">
                <el-form
                  style="width:100%"
                  :model="dataForm"
                  :rules="dataRule"
                  ref="dataForm"
                  status-icon
                  @keyup.native.enter="dataFormSubmit()"
                >
                  <el-form-item prop="mobile">
                    <el-input
                      size="middle"
                      v-model="dataForm.mobile"
                      placeholder="帐号"
                    ></el-input>
                  </el-form-item>
                  <el-form-item prop="password">
                    <el-input
                      size="middle"
                      v-model="dataForm.password"
                      type="password"
                      placeholder="密码"
                    ></el-input>
                  </el-form-item>
                  <!-- <el-form-item prop="captcha">
                    <el-row :gutter="20">
                      <el-col :span="14">
                        <el-input
                          size="middle"
                          v-model="dataForm.captcha"
                          placeholder="验证码"
                        ></el-input>
                      </el-col>
                      <el-col :span="10" class="login-captcha">
                        <img :src="captchaPath" @click="getCaptcha()" alt />
                      </el-col>
                    </el-row>
                  </el-form-item> -->
                  <el-form-item>
                    <!-- <el-button class="login-btn-submit" type="primary" @click="dataFormSubmit()">登录</el-button> -->
                    <div class="login_btn">
                      <div class="btn_container" @click="dataFormSubmit()">
                      <!-- <div class="btn_container" @click="submitLogin()"> -->
                        登录
                      </div>
                    </div>
                  </el-form-item>
                </el-form>
              </div>
            </div>
            <!-- <div class="form_divider">
              <el-divider content-position="center">其他方式登录</el-divider>
            </div>
            <div class="form_icon">
              <icon-svg name="QQ"></icon-svg>
              <icon-svg name="weixin"></icon-svg>
              <icon-svg name="weibo"></icon-svg>
              <icon-svg name="dingding"></icon-svg>
            </div> -->
          </el-col>
        </el-row>
      </div>
      <div class="site-footer">
        Copyright© 2021 All rights reserved. 冲充电站
      </div>
    </div>
    <Verify
      @success="verifySuccess"
      :mode="'pop'"
      :captchaType="'blockPuzzle'"
      :imgSize="{ width: '330px', height: '155px' }"
      ref="verify"
    ></Verify>
  </div>
</template>

<script>
import { getUUID } from "@/utils";
import Verify from "./../../components/verifition/Verify";
export default {
  components: {
    Verify
  },
  data() {
    return {
      isLoading: false,
      staticImgSrc: window.SITE_CONFIG.cdnUrl + "/static/img/admin.png",
      userArr: [],
      dataForm: {
        mobile: "",
        password: "",
        uuid: "",
        captcha: ""
      },
      dataRule: {
        mobile: [{ required: true, message: "帐号不能为空", trigger: "blur" }],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" }
        ],
        captcha: [
          { required: true, message: "验证码不能为空", trigger: "blur" }
        ]
      },
      captchaPath: ""
    };
  },
  created() {
    // this.getCaptcha();
  },
  methods: {
    // 验证成功
    verifySuccess(params) {
      console.log("params", params);
      this.dataForm.captcha = params.captchaVerification;
      // this.dataForm.captcha = 'params.captchaVerification';
      this.submitLogin();
    },
    // 提交表单
    dataFormSubmit() {
      // this.isLoading = true;
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.$refs.verify.show();
        }
      });
    },
    // 登录接口
    submitLogin() {
      this.isLoading = true;
      this.$http({
        url: this.$http.adornUrl("pc/login"),
        method: "post",
        data: this.$http.adornData({
          mobile: this.dataForm.mobile,
          password: this.dataForm.password,
          uuid: this.dataForm.uuid,
          captcha: this.dataForm.captcha
        })
      })
        .then(({ data }) => {
          if (data && data.code === 0) {
            sessionStorage.setItem("adminId", data.data.id);
            this.$cookie.set("token", data.token);
            this.$router.replace({ name: "home" });
          } else {
            //   this.getCaptcha();
            this.$message.error(data.msg);
          }
          this.isLoading = false;
        })
        .catch(e => {
          this.isLoading = false;
          this.$alert("系统异常，请联系管理员！", "提示");
        });
    },
    // 获取验证码
    getCaptcha() {
      this.dataForm.uuid = getUUID();
      this.captchaPath = this.$http.adornUrl(
        `captcha.jpg?uuid=${this.dataForm.uuid}`
      );
    }
  }
};
</script>

<style lang="scss">
.site-wrapper.site-page--login {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  // background-color: rgba(38, 50, 56, 0.4);
  overflow: hidden;
  // &:before {
  //   position: fixed;
  //   top: 0;
  //   left: 0;
  //   z-index: -1;
  //   width: 100%;
  //   height: 100%;
  //   content: "";
  //   background-image: url(~@/assets/img/bg.jpg);
  //   background-size: cover;
  // }
  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    // background: url("~@/assets/img/bg-right.png") no-repeat right bottom;
  }
  .site-content__wrapper {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 0;
    margin: 0;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: transparent;
  }
  .site-content {
    // min-height: 100%;
    // padding: 30px 500px 30px 30px;
    // margin: 200px auto;
    // margin: 0 auto;
    height: 100%;
    // padding-top: 60px;
    // padding-bottom: 48px;
    position: relative;
  }
  .site-footer {
    text-align: center;
    width: 400px;
    position: absolute;
    color: #aaa;
    bottom: 3%;
    left: calc((100% - 400px) / 2);
  }
  .login-title {
    text-align: center;
    // padding-top: 20px;
    height: 85px;
  }
  .login-title img {
    vertical-align: middle;
    width: 75px;
    height: 75px;
    margin-right: 15px;
  }
  .login-title-txt {
    font-size: 3rem;
    font-weight: bold;
    // color: #fff;
    color: #2b3e61;
    vertical-align: middle;
    letter-spacing: 15px;
  }
  .login_box {
    width: 1000px;
    margin: 0 auto;
    height: 530px;
    margin-top: calc((45% - 530px) / 2);
    box-shadow: 0px 20px 80px 0px rgba(0, 0, 0, 0.3);
  }
  .box_intro {
    height: 100%;
    position: relative;
    // background-color: rgb(70, 85, 105);
    // background-color: #2b3e61;
    // background: url(~@/assets/img/left.png) no-repeat;
    background-size: cover;
    color: #fff;
    padding: 80px 80px 48px;
  }
  // .box_intro::before {
  //   content: "";
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   bottom: 0;
  //   right: 0;
  //   background: url("~@/assets/img/left-1.png") no-repeat left top;
  // }
  // .box_intro::after {
  //   content: "";
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   bottom: 0;
  //   right: 0;
  //   background: url("~@/assets/img/left-2.png") no-repeat right bottom;
  // }
  .intro_tit {
    font-size: 40px;
    font-weight: bold;
    margin: 0;
  }
  .intro_tit_jr {
    padding-top: 10px;
    font-size: 24px;
  }
  .intro_author_wrap {
    width: 100%;
  }
  .intro_author_cont {
    margin-top: 46px;
    height: 200px;
  }
  .author_cont_name {
    color: rgb(166, 174, 185);
    font-size: 14px;
  }
  .author_cont_cont {
    margin-top: 16px;
    font-size: 14px;
    line-height: 24px;
  }
  .intro_footer {
    font-size: 14px;
    padding-top: 44px;
    margin-top: 34px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    height: 35px;
  }
  .footer_tit {
    font-size: 14px;
    font-weight: bold;
  }
  .fotter_divider {
    margin: 0 7px;
  }
  .footer_tit::after {
    content: "hot";
    position: absolute;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 1px;
    margin-top: -12px;
    background-color: #c71d23;
    -webkit-transform: scale(0.84);
    transform: scale(0.84);
  }
  .box_form {
    // height: 100%;
    background-color: rgba(255, 255, 255, 0.4);
    padding: 64px 75px 48px;
    height: 100%;
  }
  .box_form_container {
    // border: 1px solid #aaa;
    // height: 300px;
    text-align: center;
    margin-top: 10%;
  }
  .box_form_header {
    color: #696969;
    margin-bottom: 40px;
  }
  .form_headr_tit {
    font-size: 24px;
    font-weight: bold;
  }
  .login-captcha {
    overflow: hidden;
    > img {
      width: 100%;
      cursor: pointer;
    }
  }
  .login_btn {
    margin-top: 35px;
  }
  .btn_container {
    width: 100%;
    height: 40px;
    background-color: #3bb3c3;
    // background-color: #fe7300;
    color: #fff;
    letter-spacing: 10px;
    text-align: center;
    line-height: 40px;
    font-size: 20px;
    cursor: pointer;
    border-radius: 5px;
  }
  .form_divider {
    margin-top: 60px;
  }
  .form_divider .el-divider__text {
    color: #8c92a4;
  }
  .form_icon {
    text-align: center;
    display: flex;
  }
  .form_icon svg {
    width: 3em;
    height: 3em;
    // margin-right: 45px;
    flex: 1;
  }
}
</style>
