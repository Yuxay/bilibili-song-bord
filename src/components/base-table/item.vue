<template>
  <div class="base-item">
    <div class="list">
      <div class="left">{{ label }}</div>
      <!-- <slot name="content"></slot> -->
      <div class="center">
        <slot name="center"></slot>
      </div>
      <div class="right">
        <slot name="right"></slot>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    label: {
      type: String
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
  .el-button{
    height: 30px;
    padding: 3px 20px;
    font-size:12px
  }
}
</style>
