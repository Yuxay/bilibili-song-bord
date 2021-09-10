<template>
  <el-card class="spec_wrap">
    <div slot="header" class="clearfix">
      <span>添加商品规格</span>
      <!-- <el-alert
        title="输入完成后，点击提交规格按钮完成添加"
        type="warning"
        :closable="false"
      >
      </el-alert> -->
    </div>
    <el-form :model="specForm" ref="specForm" label-width="110px">
      <el-card
        :body-style="{ padding: '5px' }"
        v-for="(e, i) in specForm.specItem"
        :key="i"
      >
        <div slot="header" class="clearfix">
          规格{{ i + 1 }}
          <i
            style="float: right; padding: 3px 0"
            class="close_btn el-icon-close"
            @click="deleteItem(e)"
          ></i>
        </div>

        <el-form-item label="规格名称" :prop="'specItem.' + i + '.specName'">
          <el-input v-model="e.specName"></el-input>
        </el-form-item>
        <el-form-item label="价格" :prop="'specItem.' + i + '.tempPrice'">
          <div class="el-input el-input-group el-input-group--append">
            <el-input-number
              style="width:100%"
              :controls="false"
              type="number"
              :precision="2"
              :min="0"
              v-model="e.tempPrice"
            >
            </el-input-number>
            <div style="height:40px" class="el-input-group__append">
              元
            </div>
          </div>
        </el-form-item>
        <el-form-item label="库存" :prop="'specItem.' + i + '.specStock'">
          <div class="el-input el-input-group el-input-group--append">
            <el-input-number
              style="width:100%"
              :controls="false"
              type="number"
              :min="0"
              v-model="e.specStock"
            >
            </el-input-number>
            <div style="height:40px" class="el-input-group__append">
              件
            </div>
          </div>
        </el-form-item>
        <el-form-item label="商品重量" :prop="'specItem.' + i + '.specWeight'">
          <div class="el-input el-input-group el-input-group--append">
            <el-input-number
              style="width:100%"
              :controls="false"
              type="number"
              :min="0"
              v-model="e.specWeight"
            >
            </el-input-number>
            <div style="height:40px" class="el-input-group__append">
              克
            </div>
          </div>
        </el-form-item>
        <div class="bottom clearfix">
      <!-- <div
        style="float: right; padding: 0 0"
        class="tag_btn"
        @click="submitSpec"
      >
        提交规格
      </div> -->
    </div>
      </el-card>
      <div
        style="float: right; padding: 0 0;margin-bottom:10px"
        class="tag_btn"
        @click="pushItem"
      >
        添加规格
      </div>
    </el-form>
  </el-card>
</template>
<script>
export default {
  props: {
    parentArr: Array
  },
  model: {
    prop: "parentArr",
    event: "passArr"
  },
  data() {
    return {
      specForm: {
        specItem: [
          {
            specName: "",
            tempPrice: 0,
            specStock: 0,
            specWeight: 0
          }
        ]
      }
    };
  },
  watch: {
    parentArr(newVal) {
      let arr = this.specForm.specItem;
      let newArr = newVal;
      newArr.forEach(item => {
        item.tempPrice = this.moneyFun(parseFloat(item.specPrice), "f2y");
      });
      newVal = newArr;
      if (arr !== newVal) {
        this.specForm.specItem = newVal;
      }
    },
    specForm: {
      deep: true,
      immediate: true,
      handler: function() {
        let arr = this.specForm.specItem;
        console.log("specItem",arr)
        arr.forEach(item => {
          item.specPrice = this.moneyFun(parseFloat(item.tempPrice), "y2f");
        });
        this.$emit("passArr", arr);
      }
    },
    "specItem.tempPrice": function() {
      console.log(this.specItem.tempPrice)
      specItem.specPrice = this.moneyFun(
        parseFloat(this.specItem.tempPrice),
        "y2f"
      );
    }
  },
  methods: {
    onSubmit() {},
    submitSpec() {
      let arr = this.specForm.specItem;
      arr.forEach(item => {
        item.specPrice = this.moneyFun(parseFloat(item.tempPrice), "y2f");
      });
      console.log("methods", arr);
      this.$emit("passArr", arr);
    },
    pushItem() {
      this.specForm.specItem.push({
        specName: "",
        tempPrice: 0,
        specStock: 0,
        specWeight: 0
      });
    },
    deleteItem(item) {
      var index = this.specForm.specItem.indexOf(item);
      if (index !== -1) {
        // this.$http({
        //   url: this.$http.adornUrl("/starking/mallspec/delete"),
        //   method: "post",
        //   data: this.$http.adornData(item.id, false)
        // }).then(({ data }) => {
        //   if (data && data.code === 0) {
        //     this.$message({
        //       message: "操作成功",
        //       type: "success",
        //       duration: 1500,
        //       onClose: () => {
        //         this.getDataList();
        //       }
        //     });
        //   } else {
        //     this.$message.error(data.msg);
        //   }
        // });
        this.specForm.specItem.splice(index, 1);
      }
    }
  }
};
</script>
<style lang="scss">
.spec_wrap {
  margin: 10px 0 20px;
  .el-form-item:first-child {
    margin-top: 15px;
  }
  .el-form-item {
    margin-bottom: 22px;
  }
  .el-card {
    margin: 10px 0;
  }
  .close_btn {
    font-size: 20px;
    color: #f56c6c;
    cursor: pointer;
  }
  .tag_btn {
    width: 70px;
    height: 40px;
    background-color: #4682b4;
    border-radius: 5px;
    line-height: 40px;
    color: #fff;
    text-align: center;
    font-size: 14px;
    cursor: pointer;
  }
}
</style>
