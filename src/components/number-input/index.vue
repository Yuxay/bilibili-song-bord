<template>
  <div>
    <!-- <el-input
      v-model="inputVal"
      :step="stepVal"
      :min="minVal"
      :max="maxVal"
      type="number"
      :placeholder="placeholderVal"
      @change="handleChange"
    >
      <template slot="append">
        <div>
          {{ lastStr }}
        </div>
      </template>
    </el-input> -->
    <div class="el-input el-input-group el-input-group--append">
      <el-input-number
        style="width:100%"
        :controls="false"
        type="number"
        :step="stepVal"
        :min="minVal"
        :max="maxVal"
        :placeholder="placeholderVal"
        v-model="inputVal"
        @change="handleChange"
      >
      </el-input-number>
      <div class="el-input-group__append">
        {{ lastStr }}
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "numberInput",
  props: {
    // 父组件传值
    parentVal: Number,
    // 后缀文字
    appendStr: String,
    // 最小值
    min: {
      type: Number,
      default: 0
    },
    // 最大值
    max: {
      type: Number,
      default: 9999
    },
    // placeholder
    placeholder: {
      type: String,
      default: ""
    },
    // 间隔数
    step: {
      type: Number,
      default: 0.1
    }
  },
  model: {
    prop: "parentVal",
    event: "passVal"
  },
  data() {
    return {
      inputVal: 0
    };
  },
  computed: {
    // 后缀文字
    lastStr() {
      let str = this.appendStr;
      return str;
    },
    // 最小值
    minVal() {
      let num = this.min;
      return num;
    },
    // 最大值
    maxVal() {
      let num = this.max;
      return num;
    },
    // placeholder内容
    placeholderVal() {
      let str = this.placeholder;
      return str;
    },
    // 间隔数
    stepVal() {
      let num = this.step;
      return num;
    }
  },
  watch: {
    parentVal(newVal) {
      if (this.inputVal != newVal) {
        this.inputVal = newVal;
      }
    }
  },
  methods: {
    handleChange(val) {
      let num = val;
      if (num <= this.minVal) {
        num = this.minVal;
      }
      if (num >= this.maxVal) {
        num = this.maxVal;
      }
      this.inputVal = Number(num);
      this.$emit("passVal", this.inputVal);
    }
  }
};
</script>
