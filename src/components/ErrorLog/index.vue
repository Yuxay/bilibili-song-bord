<template>
  <div>
    <el-dialog :lock-scroll="false"
      title="Error Log"
      :visible.sync="dialogTableVisible"
      width="80%"
      append-to-body
    >
      <el-table
        :data="errorLogs"
        border
      >
        <el-table-column label="Message">
          <template slot-scope="scope">
            <div>
              <span class="message-title">Msg:</span>
              <el-tag type="danger">{{ scope.row.err.message }}</el-tag>
            </div>
            <br />
            <div>
              <span
                class="message-title"
                style="padding-right: 10px;"
              >Info: </span>
              <el-tag type="warning">{{scope.row.vm.$vnode.tag}} error in {{scope.row.info}}</el-tag>
            </div>
            <br />
            <div>
              <span
                class="message-title"
                style="padding-right: 16px;"
              >Url: </span>
              <el-tag type="success">{{scope.row.url}}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Stack">
          <template slot-scope="scope">
            {{ scope.row.err.stack}}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: "errorLog",
  props: { isShow: { type: Boolean, default: false } },
  created() {
    this.dialogTableVisible = this.isShow
  },
  data() {
    return {
      dialogTableVisible: false
    };
  },
  computed: {
    errorLogs() {
      return this.$store.getters.errorLogs;
    }
  }
};
</script>

<style scoped>
.bug-btn.el-button--small {
  padding: 9px 10px;
}
.bug-svg {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
.message-title {
  font-size: 16px;
  color: #333;
  font-weight: bold;
  padding-right: 8px;
}
</style>
