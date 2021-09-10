<template>
  <div>
    <el-tag
      :key="index"
      v-for="(tag, index) in dynamicTags"
      closable
      :disable-transitions="false"
      @close="handleClose(tag)"
    >
      {{ tag }}
    </el-tag>
    <el-input
      class="input-new-tag"
      v-if="inputVisible"
      v-model="inputValue"
      ref="saveTagInput"
      size="small"
      @keyup.enter.native="handleInputConfirm"
      @blur="handleInputConfirm"
    >
    </el-input>
    <el-button
      v-else-if="isAddTags"
      class="button-new-tag"
      size="small"
      @click="showInput"
      >+ New Tag</el-button
    >
  </div>
</template>
<script>
export default {
  name: "DynamicTagsComponent",
  model: {
    prop: "recivetags",
    event: "changeData"
  },
  props: {
    /** 接收到的标签 */
    recivetags: {
      type: [Array, String]
    },
    /** 是否返回数组 */
    returnarr: {
      type: Boolean,
      default: true
    },
    /** 接收到的分割字符，默认是一个空字符串 */
    reciveSplitStr: {
      type: String,
      default: " "
    },
    /** 返回字符串时，分割用的字符串，默认是一个空字符串 */
    returnSplitStr: {
      type: String,
      default: " "
    },
    /** 是否可以添加标签 */
    addable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      dynamicTags: [],
      inputVisible: false,
      inputValue: ""
    };
  },
  computed: {
    /** 控制添加按钮的显隐 */
    isAddTags() {
      let bool = this.addable;
      return bool;
    },
    /** 格式化接收到的数组 */
    realArr() {
      let temp = this.recivetags;
      if (typeof temp === "string") {
        this.dynamicTags = temp.split(this.reciveSplitStr);
        return temp.split(this.reciveSplitStr);
      } else if (typeof temp === "object") {
        this.dynamicTags = temp;
        return temp;
      }
    },
    /** 是否返回数组 */
    returnArray() {
      let bool = this.returnarr;
      return bool;
    },
    /** 声明 returnSplitStr */
    returnSplitKey() {
      let str = this.returnSplitStr;
      return str;
    }
  },
  watch: {
    realArr() {
      this.dynamicTags = this.realArr;
    },
    dynamicTags() {
      let arr = this.dynamicTags.concat();
      if (this.returnArray) {
        this.$emit("changeData", arr);
      } else {
        let str = arr.join(this.returnSplitKey);
        this.$emit("changeData", str);
      }
    }
  },
  methods: {
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
    },

    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.dynamicTags.push(inputValue);
      }
      this.inputVisible = false;
      this.inputValue = "";
    }
  }
};
</script>
<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
