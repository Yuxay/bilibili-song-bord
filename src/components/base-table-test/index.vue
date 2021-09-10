<template>
  <div class="base-item">
    <div class="list">
      <div class="left">{{ label }}</div>
      <div class="center">
        <slot name="center">
          <div v-if="modifyKey != parentKey">
            {{ parentVal }}{{ appendStr }}
          </div>
          <div v-else>
            <div v-if="inputType == 'textarea'">
              <el-input
                type="textarea"
                v-model="inputVal"
                :maxlength="maxlength"
                :autosize="{ minRows: 2 }"
                show-word-limit
              ></el-input>
            </div>
            <div v-else-if="inputType == 'number'">
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
                >
                </el-input-number>
                <div class="el-input-group__append">
                  {{ lastStr }}
                </div>
              </div>
            </div>
            <div v-else>
              <el-input v-model="inputVal" :maxlength="maxlength"></el-input>
            </div>
          </div>
        </slot>
      </div>
      <div class="right">
        <slot name="right">
          <div v-if="isModify">
            <el-button
              v-if="modifyKey != parentKey"
              type="text"
              @click="modifyHandle(false)"
              >修改</el-button
            >
            <div v-else>
              <el-button type="text" @click="saveItemHandle">保存</el-button>
              <el-button
                type="text"
                style="opacity: 0.7;"
                @click="modifyHandle(true)"
                >取消</el-button
              >
            </div>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>
<script>
import NumberInput from "@/components/number-input/index";
export default {
  components: { NumberInput },
  props: {
    reqKey: String,
    // 左侧的label文案
    label: {
      type: String
    },
    // 在请求中的参数key值
    keyStr: {
      type: String
    },
    // 在请求中的参数value值
    value: {
      type: String | Number
    },
    // value单位
    valAppend: String,
    // 是否开启修改功能
    isModify: {
      type: Boolean,
      default: false
    },
    // 值是否需要进行金额处理
    isMoney: {
      type: Boolean,
      default: false
    },
    /**
     * 输入框类型
     * input   普通输入框
     * textarea 多行输入
     * number 数字
     */
    inputType: {
      type: String,
      default: "input"
    },
    // 输入框限制字数
    maxlength: {
      type: Number,
      default: 90
    },
    // 数字输入框后缀文字
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
  computed: {
    // 父组件传来的接口路径中的关键字
    parentReqKey() {
      return this.reqKey;
    },
    // 父组件传来的key
    parentKey() {
      this.inputKey = this.keyStr;
      return this.keyStr;
    },
    // 父组件传来的值
    parentVal() {
      this.inputVal = this.value;
      return this.value;
      // if (!this.isMoney) {
      //   this.inputVal = this.value;
      // } else {
      //   this.inputVal = this.moneyFun(this.inputVal, "f2y");
      // }
      // return this.isMoney ? this.moneyFun(this.value, "f2y") : this.value;
    },
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
  data() {
    return {
      modifyKey: "",
      inputKey: null,
      inputVal: null
    };
  },
  methods: {
    // 点击 修改 或取消按钮
    modifyHandle(isCancel) {
      if (!isCancel) {
        //  点击修改按钮
        let sotreKey = this.$store.state.titem.label;
        if (this.parentKey != sotreKey) {
          // 判断上一条是否未保存 || 判断当前项的key是否与 vuex 中存储的key 相同
          if (!this.isEmpty(sotreKey)) {
            // 未保存直接弹窗 || 不同，且 vuex中有值，证明上一条未保存或取消
            this.$message.warning("请先保存上一条操作！");
          } else {
            // 不同，且 vuex 中无值，证明上一条已经保存或取消或无上一条
            // 向 vuex 中赋值，开始进行修改操作
            this.$store.commit("titem/updateLabel", this.parentKey);
            this.$store.commit("titem/updateValue", this.parentVal);
            this.modifyKey = this.parentKey;
            this.inputVal = this.parentVal;
          }
        }
      } else {
        // 点击取消按钮，重置数据
        this.$store.commit("titem/updateLabel", "");
        this.$store.commit("titem/updateValue", "");
        this.modifyKey = "";
      }
    },
    saveItemHandle() {
      let obj = {
        requestKey: this.parentReqKey,
        rquestLabel: this.modifyKey,
        requestVal: this.isMoney
          ? this.moneyFun(this.inputVal, "y2f")
          : this.inputVal
      };
      this.$store.commit("titem/updateLabel", "");
      this.$store.commit("titem/updateValue", "");
      this.modifyKey = "";
      this.$emit("saveItem", obj);
    }
  }
};
</script>
<style lang="scss" scoped>
$line-height: 40px;
.base-item {
  font-size: 14px;
  .list {
    width: inherit;
    height: $line-height;
    line-height: $line-height;
    padding-left: 18px;
    border: 1px solid #e0e6ed;
    border-top: none;
  }
  .left {
    // float: left;
    position: absolute;
    left: -80px;
    width: 210px;
    height: inherit;
    color: #999;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: right;
  }
  .center {
    position: relative;
    // float: left;
    position: absolute;
    left: 210px;
    width: 450px;
    height: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .right {
    // float: left;
    position: absolute;
    left: 660px;
    // width: 234px;
    width: 180px;
    height: inherit;
    line-height: $line-height;
    // color: #20a0ff;
    text-align: center;
    padding-right: 16px;
  }
  .el-button {
    height: 30px;
    padding: 3px 20px;
    font-size: 12px;
  }
}
</style>
