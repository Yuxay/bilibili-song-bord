<template>
  <div class="base">
    <div class="title">
      <div class="base-title-left">
        {{ title }}
      </div>
      <div class="base-title-right" @click="clickFun">
        {{ rtitle }}
      </div>
    </div>
    <slot></slot>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: "基本信息"
    },
    rtitle: {
      type: String,
      default: ""
    },
    funData: {
      type: Boolean
    }
  },
  data() {
    return {};
  },
  methods: {
    clickFun() {
      this.$emit("clickFun", !this.funData);
    }
  }
};
</script>
<style lang="scss" scoped>
@import "./../../assets/scss/_variables.scss";

.base {
  font-size: 14px;
  .title {
    // width: inherit;
    height: 40px;
    line-height: 40px;
    margin-top: 10px;
    color: #1f2d3d;
    padding-left: 18px;
    border: 1px solid #e0e6ed;
    background: #eff2f7;
  }
  .title::after {
    content: "";
    display: block;
    clear: both;
  }
  .base-title-left {
    display: inline-block;
  }
  .base-title-right {
    float: right;
    padding-right: 15px;
    color: $--color-primary;
    cursor: pointer;
  }
}
</style>
