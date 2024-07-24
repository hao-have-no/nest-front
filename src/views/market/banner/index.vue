<template>
  <div>
    <div class="app-container">
      <el-form
        :model="queryParams"
        ref="queryRef"
        :inline="true"
        label-width="88px"
      >
        <el-form-item label="banner标题" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="请输入标题"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="banner类型" prop="bannerType">
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
        <el-form-item label="投放平台" prop="platform">
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
        <el-form-item label="banner状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="操作状态"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in market_banner_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间" style="width: 328px">
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
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['market:banner:add']"
            >新增</el-button
          >
        </el-col>
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
              style="width: 60px"
              :preview-src-list="[scope.row.imgUrl]"
            />
          </template>
        </el-table-column>
        <el-table-column label="banner类型" prop="bannerType">
          <template #default="scope">
            <dict-tag
              :options="market_banner_classify"
              :value="scope.row.bannerType"
            />
          </template>
        </el-table-column>
        <el-table-column label="投放平台" prop="platform">
          <template #default="scope">
            <dict-tag
              :options="market_banner_platform"
              :value="scope.row.platform"
            />
          </template>
        </el-table-column>
        <el-table-column label="banner状态" align="center" prop="status">
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

      <!-- 添加或者修改banner -->
      <el-dialog :title="title" v-model="open" width="780px" append-to-body>
        <el-form
          ref="bannerRef"
          :model="form"
          :rules="rules"
          label-width="140px"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="banner标题" prop="title">
                <el-input v-model="form.title" placeholder="请输入banner标题" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="banner引导图" prop="imgUrl">
                <el-input
                  v-model="form.imgUrl"
                  placeholder="请输入banner引导图"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="banner跳转地址" prop="skipUrl">
                <el-input
                  v-model="form.skipUrl"
                  placeholder="请输入banner跳转地址"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="banner详情介绍" prop="content">
                <el-input
                  v-model="form.content"
                  placeholder="请输入banner详情介绍"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="banner类型" prop="bannerType">
                <el-select
                  v-model="form.bannerType"
                  placeholder="请选择banner类型"
                >
                  <el-option
                    v-for="dict in market_banner_classify"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="投放平台" prop="platform">
                <el-select v-model="form.platform" placeholder="请选择投放平台">
                  <el-option
                    v-for="dict in market_banner_platform"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="banner状态" prop="status">
                <el-radio-group v-model="form.status">
                  <el-radio
                    v-for="dict in market_banner_status"
                    :key="dict.value"
                    :label="dict.value"
                    >{{ dict.label }}</el-radio
                  >
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup name="Bannner">
import {
  listBanner,
  addBanner,
  updateBanner,
  delBanner,
  getBanner
} from "@/api/market/banner";
const { proxy } = getCurrentInstance();
const { market_banner_classify, market_banner_platform, market_banner_status } =
  proxy.useDict(
    "market_banner_classify",
    "market_banner_platform",
    "market_banner_status"
  );

const total = ref(0);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const open = ref(false);
const title = ref("");
const loading = ref(true);
const dateRange = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: "", //名称
    bannerType: "", //类型
    platform: "", //平台
    post: "", //位置
    status: "", // 状态
  },
  rules: {
    title: [{ required: true, message: "banner标题不能为空", trigger: "blur" }],
    imgUrl: [{ required: true, message: "图片地址不能为空", trigger: "blur" }],
    bannerType: [
      { required: true, message: "banner类型不能为空", trigger: "change" },
    ],
    platform: [
      { required: true, message: "投放平台不能为空", trigger: "change" },
    ],
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

const { queryParams, form, rules } = toRefs(data);

// 查询banner列表
function getList() {
  loading.value = true;
  listBanner(queryParams.value).then((response) => {
    bannerList.value = response.data.list;
    loading.value = false;
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    bannerId: undefined,
    title: undefined,
    imgUrl: undefined,
    skipUrl: undefined,
    content: "",
    bannerType: "0",
    platform: "0",
    post: "0",
    status: "0",
  };
  proxy.resetForm("bannerRef");
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["bannerRef"].validate((valid) => {
    if (valid) {
      if (form.value.bannerId != null) {
        updateBanner(form.value).then((res) => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addBanner(form.value).then((res) => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加banner图";
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

/**修改按钮操作 */
function handleUpdate(row) {
  reset();
  const bannerId = row.bannerId || ids.value;
  getBanner(bannerId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改banner";
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const bannerIds = row.bannerId || ids.value;
  proxy.$modal
    .confirm('是否确认删除编号为"' + bannerIds + '"的数据项?')
    .then(function () {
      return delBanner(bannerIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    })
    .catch(() => {});
}

// 多选
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.bannerId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

// banner是否启用
function handleStatusChange(row) {
  let text = row.status === "0" ? "上架" : "下架";
  console.log('----')
  proxy.$modal
    .confirm("确认要" + text + "吗?")
    .then(function () {
      return updateBanner(row);
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
