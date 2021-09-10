<template>
  <div class="mod-config">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="getDataList()"
    >
      <el-form-item>
        <el-input
          v-model="dataForm.keyName"
          placeholder="参数名"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <!-- <el-button
          type="danger"
          @click="deleteHandle()"
          :disabled="dataListSelections.length <= 0"
          >批量删除</el-button
        > -->
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      stripe
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%;"
    >
      <!-- <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="50"
      >
      </el-table-column> -->
      <el-table-column
        label="序号"
        header-align="center"
        align="center"
        type="index"
        width="50"
      >
      </el-table-column>
      <el-table-column
        prop="keyName"
        header-align="center"
        align="center"
        label="参数名"
      >
      </el-table-column>
      <el-table-column
        prop="keyValue"
        header-align="center"
        align="center"
        label="参数值"
      >
      </el-table-column>
      <el-table-column
        prop="keyDesc"
        header-align="center"
        align="center"
        label="备注"
      >
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="150"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click="addOrUpdateHandle(scope.row.id)"
            >修改</el-button
          >
          <el-button type="text" size="small" @click="deleteHandle(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper"
    >
    </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update
      v-if="addOrUpdateVisible"
      ref="addOrUpdate"
      @refreshDataList="getDataList"
    ></add-or-update>
  </div>
</template>

<script>
import AddOrUpdate from "./config-add-or-update";
export default {
  data() {
    return {
      dataForm: {
        keyName: ""
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 20,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false
    };
  },
  components: {
    AddOrUpdate
  },
  activated() {
    this.getDataList();
  },
  methods: {
    // 获取数据列表
    getDataList() {
      let _this = this;
      this.dataListLoading = true;
      let params = { page: this.pageIndex, limit: this.pageSize };
      !this.isEmpty(this.dataForm.keyName)
        ? (params["keyName"] = this.dataForm.keyName)
        : params;
      this.$http({
        url: this.$http.adornUrl("/pc/v1/config/list"),
        method: "get",
        params: this.$http.adornParams(params)
      })
        .then(({ data }) => {
          if (data && data.code === 0) {
            this.dataListLoading = false;
            this.dataList = data.page.list;
            this.totalPage = data.page.totalCount;
          } else {
            this.dataListLoading = false;
            this.dataList = [];
            this.totalPage = 0;
          }
        })
        .catch(() => {
          _this.$alert("系统异常，请联系管理员！", "提示");
        });
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val;
      this.pageIndex = 1;
      this.getDataList();
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageIndex = val;
      this.getDataList();
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },
    // 新增 / 修改
    addOrUpdateHandle(id) {
      this.addOrUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id);
      });
    },
    // 删除
    deleteHandle(item) {
      this.$confirm(`确定删除参数：${item.keyName} 吗?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http({
            url: this.$http.adornUrl("/pc/v1/config/delete"),
            method: "get",
            params: this.$http.adornParams(
              {
                key: item.keyName
              },
              false
            )
          })
            .then(({ data }) => {
              if (data && data.code === 0) {
                this.$message({
                  message: "操作成功",
                  type: "success",
                  duration: 1500,
                  onClose: () => {
                    this.getDataList();
                  }
                });
              } else {
                this.$message.error(data.msg);
              }
            })
            .catch(() => {
              _this.$alert("系统异常，请联系管理员！", "提示");
            });
        })
        .catch(() => {});
    }
  }
};
</script>
