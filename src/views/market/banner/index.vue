<template>
  <div>
    <div class="app-container">
      <el-form
        :model="queryParams"
        ref="queryRef"
        :inline="true"
        label-width="68px"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="请输入标题"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="类型" prop="bannerType">
          <el-select
            v-model="queryParams.bannerType"
            placeholder="操作类型"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in market_banner_classify"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="平台" prop="platform">
          <el-select
            v-model="queryParams.platform"
            placeholder="操作类型"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in market_banner_platform"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="位置" prop="post">
          <el-select
            v-model="queryParams.post"
            placeholder="操作类型"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in market_banner_post"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="操作状态"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in sys_common_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间" style="width: 308px">
          <el-date-picker
            v-model="dateRange"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="[
              new Date(2000, 1, 1, 0, 0, 0),
              new Date(2000, 1, 1, 23, 59, 59),
            ]"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery"
            >搜索</el-button
          >
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['market:banner:remove']"
            >删除</el-button
          >
        </el-col>
      </el-row>

      <el-table
        v-loading="loading"
        :data="bannerList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="banner标题" prop="title" />
        <el-table-column label="banner图片" prop="url" width="120">
          <template #default="scope">
            <el-image
              :src="scope.row.imgUrl"
              style="width:60px"
              :preview-src-list="[scope.row.imgUrl]"
            />
          </template>
        </el-table-column>
        <el-table-column label="banner类型" prop="bannerType">
          <template #default="scope">
              <dict-tag :options="market_banner_classify" :value="scope.row.bannerType" />
          </template>
        </el-table-column>
        <el-table-column label="平台" prop="platform">
          <template #default="scope">
              <dict-tag :options="market_banner_platform" :value="scope.row.platform" />
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="0"
              active-text="上架"
              inactive-value="1"
              inactive-text="下架"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-button
              type="text"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['market:banner:edit']"
              >修改</el-button
            >
            <el-button
              type="text"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['market:banner:remove']"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />

    </div>
  </div>
</template>

<script setup name="Bannner">
import { listBanner } from "@/api/market/banner";
const { proxy } = getCurrentInstance();
const { market_banner_classify,market_banner_platform,market_banner_post } = proxy.useDict("market_banner_classify","market_banner_platform","market_banner_post");

const total = ref(0);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const loading = ref(true);

const dateRange = ref([]);
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: "", //名称
    bannerType: "", //类型
    platform:"",//平台
    post:"",//位置
    status: "", // 状态
  },
});

const bannerList = ref([
//   {
//     id: 1,
//     title: "首页轮播图",
//     content: "首页轮播图",
//     url: "http://backend-api-02.newbee.ltd/upload/20240711_14163473.png",
//     status: 1,
//   },
]);

const { queryParams, form } = toRefs(data);

// 查询banner列表
function getList() {
  loading.value = true;
  listBanner(queryParams.value).then((response) => {
    bannerList.value =  response.data.list;
    loading.value = false;
  });
}

/** 搜索按钮操作 */
function handleQuery() {
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 删除按钮操作 */
function handleDelete(row) {
  const bannerIds = row.id || ids.value;
  proxy.$modal
    .confirm('是否确认删除编号为"' + bannerIds + '"的数据项?')
    .then(function () {
      return delRole(roleIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    })
    .catch(() => {});
}

// 多选
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.roleId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

// banner是否启用
function handleStatusChange(row) {
  let text = row.status === "0" ? "上架" : "下架";
  proxy.$modal
    .confirm('确认要' + text +'吗?')
    .then(function () {
      return changeBannerStatus(row.roleId, row.status);
    })
    .then(() => {
      proxy.$modal.msgSuccess(text + "成功");
    })
    .catch(function () {
      row.status = row.status === "0" ? "下架" : "上架";
    });
}

getList();

</script>

<style></style>
