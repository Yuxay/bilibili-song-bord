<template>
  <div>
    <el-drawer
      v-loading="isLoading"
      title="设置"
      :visible.sync="visible"
      direction="rtl"
      :size="drawerSize"
      :destroy-on-close="true"
      :show-close="true"
      :wrapperClosable="true"
    >
      <el-form
        :model="dataForm"
        ref="dataForm"
        label-width="110px"
        :inline="false"
        size="normal"
      >
        <el-form-item label="用户点歌冷却">
          <div style="display:flex">
            <el-slider
              style="flex:1"
              v-model="dataForm.userCd"
              :format-tooltip="userCdFormat"
            ></el-slider>
            <span style="padding: 0 5px 0 15px;"
              >{{ dataForm.userCd }}分钟</span
            >
          </div>
        </el-form-item>
        <el-form-item label="歌曲冷却">
          <div style="display:flex">
            <el-slider
              style="flex:1"
              v-model="dataForm.songCd"
              :format-tooltip="songCdFormat"
            ></el-slider>
            <span style="padding: 0 5px 0 15px;"
              >{{ dataForm.songCd }}小时</span
            >
          </div>
        </el-form-item>
        <el-form-item>
          <el-button size="medium" @click="cancelHandle">取消</el-button>
          <el-button size="medium" type="primary" @click="dataFormSubmit"
            >提交</el-button
          >
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>
<script>
export default {
  data() {
    return {
      isLoading: false,
      drawerSize: "30%",
      isMobile: false,
      visible: false,
      dataForm: {
        id: 0,
        songCd: 24,
        userCd: 3,
        roomId: 0,
        maxNum: 100
      }
    };
  },
  mounted() {
    if (!window.navigator) {
      // FR.Msg.alert("提示", "当前设备：移动端APP");
      this.drawerSize = "100%";
      this.isMobile = true;
    } else {
      if (/Mobile|Android|webOS|iPhone|iPad|Phone/i.test(navigator.userAgent)) {
        // FR.Msg.alert("提示", "当前设备：移动端H5");
        this.drawerSize = "100%";
        this.isMobile = true;
      } else {
        // FR.Msg.alert("提示", "当前设备：PC端");
        this.drawerSize = "30%";
        this.isMobile = false;
      }
    }
  },
  methods: {
    songCdFormat(val) {
      return val + "小时";
    },
    userCdFormat(val) {
      return val + "分钟";
    },
    init(roomId) {
      let _this = this;
      this.isLoading = true;
      this.visible = true;
      this.dataForm.roomId = !this.isEmpty(roomId) && roomId != 0 ? roomId : 0;
      this.$http({
        url: this.$http.adornUrl("/room/config/select"),
        method: "get",
        params: this.$http.adornParams({
          roomId: _this.dataForm.roomId
        })
      })
        .then(({ data }) => {
          if (data && data.code == 0) {
            console.log("data: ", data);
            this.dataForm.id = data.data.id;
            this.dataForm.roomId = data.data.roomId;
            this.dataForm.userCd = data.data.userCd;
            this.dataForm.songCd = data.data.songCd;
            this.dataForm.maxNum = data.data.maxNum;
            _this.isLoading = false;
          } else {
            _this.isLoading = false;
            _this.$message({
              type: "error",
              message: data.msg
            });
          }
        })
        .catch(() => {
          _this.isLoading = false;
        });
    },
    cancelHandle() {
      this.dataForm = {
        id: 0,
        userCd: 3,
        songCd: 24,
        roomId: 0,
        maxNum: 100
      };
      this.visible = false;
    },
    dataFormSubmit() {
      let _this = this;
      this.isLoading = true;
      let params = {};
      !this.isEmpty(_this.dataForm.id) && _this.dataForm.id != 0
        ? (params["id"] = _this.dataForm.id)
        : params;
      params["userCd"] = _this.dataForm.userCd;
      params["songCd"] = _this.dataForm.songCd;
      params["roomId"] = _this.dataForm.roomId;
      params["maxNum"] = _this.dataForm.maxNum;
      this.$http({
        url: this.$http.adornUrl(
          `/room/config/${
            !_this.isEmpty(_this.dataForm.id) && _this.dataForm.id != 0
              ? "update"
              : "create"
          }`
        ),
        method: "post",
        data: this.$http.adornData(params)
      })
        .then(({ data }) => {
          if (data && data.code == 0) {
            if (_this.isMobile) {
              _this.isLoading = false;
              _this.$notify({
                type: "success",
                message: "操作成功！",
                duration: 1500,
                onClose: () => {
                  _this.cancelHandle();
                }
              });
            } else {
              _this.isLoading = false;
              _this.$message({
                type: "success",
                message: "操作成功！",
                duration: 1500,
                onClose: () => {
                  _this.cancelHandle();
                }
              });
            }
          } else {
            if (_this.isMobile) {
              _this.isLoading = false;
              _this.$notify({
                type: "danger",
                message: data.msg
              });
            } else {
              _this.isLoading = false;
              _this.$message({
                type: "error",
                message: data.msg
              });
            }
          }
        })
        .catch(err => {
          _this.isLoading = false;
        });
    }
  }
};
</script>
