<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-cascades"></i> 新闻管理
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-select
          v-model="query.category_id"
          placeholder="选择新闻类型"
          class="handle-select mr10"
        >
          <el-option
            v-for="(value, index) in categoryList"
            :key="index"
            :label="value"
            :value="index"
            >{{ value }}</el-option
          >
        </el-select>
        <el-button type="primary" @click="handleSearch">拉取新闻</el-button>
      </div>

      <el-table
        :data="tableData"
        border
        class="table"
        ref="multipleTable"
        header-cell-class-name="table-header"
        v-loading="loading"
      >
        <el-table-column
          prop="date"
          label="发布日期"
          sortable
          :sort-method="sortMethod"
        >
          <template #default="scope">
            {{
              dayjs(scope.row.created_at_ts).format("YYYY-MM-DD HH:mm:ss")
            }}</template
          >
        </el-table-column>
        <el-table-column
          prop="article_id"
          label="ID"
          width="55"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="category_id"
          label="类别"
          width="100px"
          :filters="typeList"
          :filter-method="filterTag"
        >
          <template #default="scope"
            ><el-tag :type="'success'">{{
              categoryList[scope.row.category_id]
            }}</el-tag></template
          >
        </el-table-column>
        <el-table-column label="标题">
          <template #default="scope"
            ><div class="title">{{ scope.row.title }}</div></template
          >
        </el-table-column>
        <el-table-column label="正文">
          <template #default="scope"
            ><div class="content" style="white-space: nowrap">
              {{ scope.row.content }}
            </div></template
          >
        </el-table-column>
        <el-table-column label="正文长度">
          <template #default="scope"
            ><div class="title">{{ scope.row.words_count }}</div></template
          >
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :current-page="currentPage"
          :page-size="query.limit"
          :total="pageTotal"
          @current-change="handlePageChange"
        ></el-pagination>
      </div>
    </div>

    <!-- 编辑弹出框 -->
    <el-dialog title="编辑" v-model="editVisible" width="30%">
      <el-form label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveEdit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from "vue";
import dayjs from "dayjs";
import { ElMessage, ElMessageBox } from "element-plus";
import { getArticles } from "../api/index";
import { categoryList } from "../const/index";

// 类别筛选
function getTypeHooks() {
  const typeList = categoryList.map((item, index) => ({
    text: item,
    value: index,
  }));
  const filterTag = (value, row) => {
    return row.category_id === value;
  };
  return [typeList, filterTag];
}

function getTableHooks() {
  const query = reactive({
    offset: 0,
    limit: 10,
    category_id: 14,
  });
  const tableData = ref([]);
  const pageTotal = ref(0);
  const currentPage = ref(1);
  const loading = ref(true);
  // 获取表格数据
  const getData = () => {
    loading.value = true;
    getArticles(query).then((res) => {
      tableData.value = res.list;
      pageTotal.value = res.page_total || 50;
      loading.value = false;
    });
  };
  getData();

  // 查询操作
  const handleSearch = () => {
    getData();
  };
  // 分页导航
  const handlePageChange = (val) => {
    query.offset = (val - 1) * 10;
    currentPage.value = val;
    getData();
  };
  return [
    query,
    tableData,
    pageTotal,
    currentPage,
    loading,
    handleSearch,
    handlePageChange,
  ];
}

export default {
  name: "basetable",
  setup() {
    const [typeList, filterTag] = getTypeHooks();
    const sortMethod = (a, b) => {
      return a > b;
    };
    const [
      query,
      tableData,
      pageTotal,
      currentPage,
      loading,
      handleSearch,
      handlePageChange,
    ] = getTableHooks();

    // 表格编辑时弹窗和保存
    const editVisible = ref(false);
    let form = reactive({
      name: "",
      address: "",
    });
    let idx = -1;
    const handleEdit = (index, row) => {
      idx = index;
      Object.keys(form).forEach((item) => {
        form[item] = row[item];
      });
      editVisible.value = true;
    };
    const saveEdit = () => {
      editVisible.value = false;
      ElMessage.success(`修改第 ${idx + 1} 行成功`);
      Object.keys(form).forEach((item) => {
        tableData.value[idx][item] = form[item];
      });
    };

    return {
      query,
      tableData,
      pageTotal,
      editVisible,
      form,
      handleSearch,
      handlePageChange,
      handleEdit,
      saveEdit,
      categoryList,
      dayjs,
      typeList,
      filterTag,
      sortMethod,
      loading,
      currentPage,
    };
  },
};
</script>

<style scoped>
.handle-box {
  margin-bottom: 20px;
}
.content {
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -moz-box;
  -moz-line-clamp: 2;
  -moz-box-orient: vertical;
  overflow-wrap: break-word;
  word-break: break-all;
  white-space: normal;
}
.handle-select {
  width: 120px;
}

.handle-input {
  width: 300px;
  display: inline-block;
}
.table {
  width: 100%;
  font-size: 14px;
}
.red {
  color: #ff0000;
}
.mr10 {
  margin-right: 10px;
}
.table-td-thumb {
  display: block;
  margin: auto;
  width: 40px;
  height: 40px;
}
</style>
