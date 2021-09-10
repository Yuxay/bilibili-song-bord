<template>
  <div>
    <el-cascader
      placeholder="试试搜索：西安"
      :options="options"
      filterable
      @change="handleAreaChange"
      :props="props"
      clearable
      v-model="value"
    ></el-cascader>
  </div>
</template>
<script>
import areaData from "@/utils/area.json";
export default {
  props: {
    areaVal: { type: String },
    isShowLast: { type: Boolean, default: true },
    isCheckLast:{ type: Boolean, default: true }
  },
  data() {
    return {
      isResouceShow: 0,
      options: [],
      props: {
        label: "label",
        value: "label",
        checkStrictly: this.isCheckLast
      },
      value: []
    };
  },
  created() {
    if (!this.isShowLast) {
      let arr = areaData.concat();
      arr.forEach(province => {
        province.children.forEach(item => {
          delete item.children;
        });
      });
      this.options = arr;
    } else {
      this.options = areaData;
    }
    if (this.areaVal) {
      this.value = this.areaVal.split(" ");
    }
  },
  methods: {
    handleAreaChange(val) {
      this.value = val;
      if (val.length > 1 && this.isShowLast) {
        for (let i = 0; i < val.length; i++) {
          if (val[i] === val[i + 1]) {
            val.splice(i, i + 1);
          }
        }
      }
      ++this.isResouceShow;
      this.$emit("childFun", val.join(" "));
    }
  }
};
</script>