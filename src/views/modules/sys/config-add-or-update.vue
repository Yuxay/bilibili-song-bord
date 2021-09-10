<template>
  <el-dialog :lock-scroll="false"
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible"
  >
    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataForm"
      @keyup.enter.native="dataFormSubmit()"
      label-width="80px"
    >
      <el-form-item label="参数名" prop="keyName">
        <el-input
          :disabled="isDisabled"
          v-model="dataForm.keyName"
          placeholder="参数名"
        ></el-input>
      </el-form-item>
      <el-form-item label="参数值" prop="keyValue">
        <el-input v-model="dataForm.keyValue" placeholder="参数值"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="keyDesc">
        <el-input v-model="dataForm.keyDesc" placeholder="备注"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">保存</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      isDisabled: false,
      visible: false,
      dataForm: {
        id: 0,
        keyName: "",
        keyValue: "",
        keyDesc: ""
      },
      dataRule: {
        keyName: [
          { required: true, message: "参数名不能为空", trigger: "blur" }
        ],
        keyValue: [
          { required: true, message: "参数值不能为空", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    init(id) {
      this.dataForm.id = id || 0;
      if (!this.isEmpty(this.dataForm.id) && this.dataForm.id != 0) {
        this.isDisabled = true;
      } else {
        this.isDisabled = false;
      }
      this.visible = true;
      let _this = this;
      this.$nextTick(() => {
        this.$refs["dataForm"].resetFields();
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/pc/v1/config/info/${this.dataForm.id}`),
            method: "get",
            params: this.$http.adornParams()
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.keyName = data.config.keyName;
              this.dataForm.keyValue = data.config.keyValue;
              this.dataForm.keyDesc = data.config.keyDesc;
            }else{
              _this.$message.error(data.msg)
            }
          }).catch(()=>{
            _this.$alert("系统异常，请联系管理员！", "提示");
          });
        }
      });
    },
    // 表单提交
    dataFormSubmit() {
      let _this = this;
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(
              `/pc/v1/config/${!this.dataForm.id ? "save" : "update"}`
            ),
            method: "post",
            data: this.$http.adornData({
              id: this.dataForm.id || undefined,
              keyName: this.dataForm.keyName,
              keyValue: this.dataForm.keyValue,
              keyDesc: this.dataForm.keyDesc
            })
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message({
                message: "操作成功",
                type: "success",
                duration: 1500,
                onClose: () => {
                  this.visible = false;
                  this.$emit("refreshDataList");
                }
              });
            } else {
              this.$message.error(data.msg);
            }
          }).catch(()=>{
            _this.$alert("系统异常，请联系管理员！", "提示");
          });
        }
      });
    }
  }
};
</script>
