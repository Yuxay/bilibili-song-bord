<template>
  <div>
    <el-form
      v-if="this.requestUrl == '/starking/course/group-select'"
      :inline="true"
      :model="dataForm"
      style="margin-bottom:15px"
    >
      <el-form-item style="margin-top:10px" label="课程名称" size="normal">
        <el-input
          v-model="dataForm.key"
          placeholder="请输入课程名称"
          size="normal"
          clearable
          @change=""
        ></el-input>
      </el-form-item>

      <el-form-item style="margin-top:10px" label="课程类型">
        <el-select
          v-model="dataForm.type"
          placeholder="请选择课程类型"
          clearable
        >
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item style="margin-top:10px" label="课程标签">
        <el-select
          v-model="dataForm.tags"
          placeholder="请选择课程标签"
          clearable
        >
          <el-option
            v-for="item in tagList"
            :key="item.value"
            :label="item.value"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item style="margin-top:10px" label="课程等级">
        <el-select
          v-model="dataForm.level"
          clearable
          placeholder="请选择课程等级"
        >
          <el-option
            v-for="item in levelList"
            :key="item.value"
            :label="item.value"
            :value="item.value"
          >
          </el-option> </el-select
      ></el-form-item>
      <el-form-item style="margin-top:10px">
        <el-button size="normal" @click="getTableData()">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="selectTable"
      :data="dataList"
      border
      v-loading="dataListLoading"
      :highlight-current-row="!isMultipe"
      @current-change="handleCurrentChange"
      @selection-change="selectionChangeHandle"
      style="width: 100%;"
    >
      <div v-if="isParentMultipe">
        <el-table-column
          fixed="left"
          type="selection"
          header-align="center"
          align="center"
          width="50"
        >
        </el-table-column>
      </div>
      <el-table-column
        v-if="isBlank(columns)"
        header-align="center"
        align="center"
      >
      </el-table-column>
      <el-table-column
        header-align="center"
        align="center"
        v-for="col in columns"
        :prop="col.id"
        :key="col.id"
        :label="col.label"
        :width="col.width"
      >
        <template slot-scope="scope">
          <div v-if="!isBlank(col.isImg) && col.isImg == 0" class="table-img">
            <img :src="scope.row[col.id]" alt="" />
          </div>
          <div v-else-if="col.id == 'courseType'">
            {{ typeFun(scope.row[col.id]) }}
          </div>
          <div v-else>{{ scope.row[col.id] }}</div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, prev, pager, next, jumper"
    >
    </el-pagination>
  </div>
</template>
<script>
export default {
  /**
   * parentColumns
   * [{
   *    id:"单列关联的数据key值"
   *    label:"单列名称",
   *    width:"单列宽度",
   *    isImg:"当前列是否为图片"
   * }]
   */
  props: {
    parentId: { type: String, defalut: "" },
    requestUrl: String,
    parentColumns: Array,
    isParentMultipe: { type: Boolean, default: false }
  },
  model: {
    prop: "parentId",
    event: "passId"
  },
  data() {
    return {
      dataListLoading: false,
      dataForm: {
        key: "",
        tags: "",
        level: "",
        type: ""
      },
      dataList: [],
      dataListSelections: [], // 多选的数据
      currentSelected: {}, // 单选数据
      currentSelectedId: "", // 单选数据的ID
      selectIds: [],
      tagList: [], // 课程标签列表
      levelList: [], // 课程等级列表
      typeList: [
        { label: "陪练课", value: "COURSE_1V1" },
        { label: "小班课", value: "COURSE_1VN" },
        { label: "录播课", value: "COURSE_RECORD" }
      ], // 课程类型列表
      pageIndex: 1,
      pageSize: 20,
      totalPage: 0,
      allSelectData: []
    };
  },
  // mounted() {
  //   this.dataList = [];
  //   if (!this.isBlank(this.requestUrl)) {
  //     if (this.requestUrl == "/starking/mallgoods/list") {
  //       this.getMallData();
  //     } else {
  //       this.getTableData();
  //     }
  //   } else {
  //     this.dataList = [];
  //   }
  // },
  computed: {
    // 表格的列数据
    columns: {
      get() {
        let arr = this.parentColumns;
        return arr;
      },
      set(val) {}
    },
    // 多选选中的ID
    listSelectIds: {
      get() {
        let arr = this.dataListSelections;
        let resArr = [];
        if (!this.isBlank(arr)) {
          arr.forEach(item => {
            resArr.push(item.id);
          });
        }
        return resArr;
      },
      set(val) {}
    },
    // 是否多选
    isMultipe: {
      get() {
        let boolean = this.isParentMultipe;
        return boolean;
      },
      set(val) {}
    }
  },
  watch: {
    // 接收父组件传值
    parentId: {
      immediate: true,
      handler: function(newVal, oldVal) {
        if (!this.isMultipe) {
          // debugger
          if (this.currentSelectedId !== newVal) {
            this.currentSelectedId = newVal;
          }
        } else {
          // let arr = [];
          // if(!this.isBlank(newVal) && newVal!== "[]"){
          //   arr= JSON.parse(newVal);
          // }else if(newVal== "[]"){
          //   arr= JSON.parse(oldVal);
          // }
          let arr =
            !this.isBlank(newVal) && newVal !== "[]" ? JSON.parse(newVal) : [];
          // debugger
          if (this.selectIds !== arr) {
            this.selectIds = arr;
          }
          this.allSelectData = this.selectIds;
        }
        this.draw();
      }
    },
    // 接收请求路径，获取数据列表
    requestUrl: {
      immediate: true,
      handler: function() {
        if (!this.isBlank(this.requestUrl)) {
          if (this.requestUrl == "/starking/mallgoods/list") {
            this.getMallData();
          } else {
            this.getCourseTags();
            this.getCourseLevel();
            this.getTableData();
          }
        } else {
          this.dataList = [];
        }
      }
    },
    // 单选传递选中数据给父组件
    currentSelected() {
      if (!this.isMultipe) {
        // debugger
        let obj = this.currentSelected;
        // this.currentSelectedId = obj.id;
        // this.$emit("passId", this.currentSelectedId);
        // this.currentSelectedId = obj.id;
        this.$emit("passId", obj.id);
      }
    },
    // 多选传递选中数据给父组件
    dataListSelections() {
      if (this.isMultipe) {
        let arr = this.dataListSelections;
        let resArr = [];
        if (!this.isBlank(arr)) {
          arr.forEach(item => {
            resArr.push(item.id);
          });
        }
        // this.$emit("passId", JSON.stringify(resArr));
      }
    },
    allSelectData() {
      this.$emit("passId", JSON.stringify(this.allSelectData));
    }
  },
  methods: {
    resetData() {
      this.dataList = [];
      this.columns = [];
      this.dataListSelections = [];
    },
    // 单选的change事件
    handleCurrentChange(val) {
      this.currentSelected = val;
    },
    // 获取商品数据
    getMallData() {
      this.dataList = [];
      this.columns = [];
      this.dataListSelections = [];
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl(this.requestUrl),
        method: "post",
        params: this.$http.adornParams({
          current: this.pageIndex,
          goodsStatus: 1
        })
      })
        .then(({ data }) => {
          if (data && data.code === 0) {
            let tempArr = [];
            if (!this.isBlank(data.page.list)) {
              this.dataList = data.page.list;
              this.totalPage = data.page.totalCount;
            }
            if (!this.isBlank(data.list)) {
              this.dataList = data.list;
            }
            let arr = this.dataList;
            // 单选的默认选中
            if (!this.isMultipe) {
              let str = this.currentSelectedId;
              arr.forEach(item => {
                if (item.id == str) {
                  this.$refs["selectTable"].setCurrentRow(item, true);
                }
              });
            } else {
              // 多选的默认选中
              let selectArr = this.selectIds;
              let res = this.match_(selectArr, this.dataList);
              this.$nextTick(() => {
                res.forEach(row => {
                  this.$refs.selectTable.toggleRowSelection(row, true);
                });
              });
            }
          } else {
            this.dataList = [];
          }
          this.dataListLoading = false;
        })
        .catch(() => {
          this.dataList = [];
          this.totalCount = 0;
          this.dataListLoading = false;
        });
    },
    // 获取表格数据
    getTableData() {
      this.dataList = [];
      this.columns = [];
      this.dataListSelections = [];
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl(this.requestUrl),
        method: "post",
        params: this.$http.adornParams({
          current: this.pageIndex,
          key: this.dataForm.key,
          level: this.dataForm.level,
          tags: this.dataForm.tags,
          type: this.dataForm.type
        })
      })
        .then(({ data }) => {
          if (data && data.code === 0) {
            let tempArr = [];
            if (!this.isBlank(data.page.list)) {
              this.dataList = data.page.list;
              this.totalPage = data.page.totalCount;
            }
            if (!this.isBlank(data.list)) {
              this.dataList = data.list;
            }
            this.draw();
          } else {
            this.dataList = [];
          }
          this.dataListLoading = false;
        })
        .catch(() => {
          this.dataList = [];
          this.totalCount = 0;
          this.dataListLoading = false;
        });
    },
    draw() {
      let arr = this.dataList;
      // 单选的默认选中
      if (!this.isMultipe) {
        let str = this.currentSelectedId;
        arr.forEach(item => {
          // debugger
          if (item.id == str) {
            this.$refs["selectTable"].setCurrentRow(item, true);
          }
        });
      } else {
        //   this.setSelectRow();
        // 多选的默认选中
        let selectArr = this.allSelectData;
        let res = this.match_(selectArr, this.dataList);
        this.$nextTick(() => {
          res.forEach(row => {
            this.$refs.selectTable.toggleRowSelection(row, true);
          });
        });
      }
    },
    match_(idArr, listArr) {
      let arr = [];
      // let idLen = idArr.length;
      // let listLen = listArr.length;
      // let langLen = this.max(idLen, listLen);
      // let shortLen = this.min(idLen, listLen);
      for (let idIndex = 0; idIndex < idArr.length; idIndex++) {
        const element = idArr[idIndex];
        for (let listIndex = 0; listIndex < listArr.length; listIndex++) {
          if (element == listArr[listIndex].id) {
            arr.push(listArr[listIndex]);
          }
        }
      }
      return arr;
    },
    max(first, second) {
      return first > second ? first : second;
    },
    min(first, second) {
      return first < second ? first : second;
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val;
      this.pageIndex = 1;
      // this.getTableData();
      if (this.requestUrl == "/starking/mallgoods/list") {
        this.getMallData();
      } else {
        this.getTableData();
      }
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageIndex = val;
      // this.getTableData();
      if (this.requestUrl == "/starking/mallgoods/list") {
        this.getMallData();
      } else {
        this.getTableData();
      }
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;

      let that = this;
      let currentSelectIds = [];
      val.forEach(item => {
        currentSelectIds.push(item.id);
      });
      let dataList = that.dataList;
      let noSelectIds = [];
      dataList.forEach(item => {
        if (currentSelectIds.indexOf(item.id) < 0) {
          noSelectIds.push(item.id);
        }
      });

      let allSelectData = that.allSelectData;
      noSelectIds.forEach(id => {
        for (let i = 0; i < allSelectData.length; i++) {
          if (allSelectData[i] == id) {
            // 如果总选择中有未被选中的，那么就删除这条
            allSelectData.splice(i, 1);
            break;
          }
        }
      });

      currentSelectIds.forEach(id => {
        allSelectData.push(id);
      });
      that.allSelectData = [...new Set(allSelectData)];
      console.log("allSelectData", that.allSelectData);
    },
    getCourseList() {
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl("/starking/course/list"),
        method: "post",
        params: this.$http.adornParams({
          current: this.pageIndex,
          key: this.dataForm.key
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.dataList = data.page.list;
          this.totalPage = data.page.totalCount;
        } else {
          this.dataList = [];
          this.totalPage = 0;
        }
        this.dataListLoading = false;
      });
    },
    // 获取课程标签列表
    getCourseTags() {
      this.$http({
        url: this.$http.adornUrl("/starking/config/key/course_tags_list"),
        method: "get",
        params: this.$http.adornParams()
      }).then(({ data }) => {
        if (data && data.code === 0) {
          let arr = JSON.parse(data.config.conValue);
          this.tagList = arr;
        } else {
          this.tagList = [];
        }
      });
    },
    // 获取课程等级列表
    getCourseLevel() {
      this.$http({
        url: this.$http.adornUrl("/starking/config/key/course_level_list"),
        method: "get",
        params: this.$http.adornParams()
      }).then(({ data }) => {
        if (data && data.code === 0) {
          let arr = JSON.parse(data.config.conValue);
          this.levelList = arr;
        } else {
          this.levelList = [];
        }
      });
    },
    typeFun(val) {
      let str = "";
      let arr = [
        { label: "直播公开课", value: "COURSE_LIVE" },
        { label: "陪练课", value: "COURSE_1V1" },
        { label: "小班课", value: "COURSE_1VN" },
        { label: "录播课", value: "COURSE_RECORD" }
      ];
      arr.forEach(item => {
        if (item.value == val) {
          str = item.label;
        }
      });
      return str;
    },
  }
};
</script>
