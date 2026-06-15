<template>
  <AppLayout :breadcrumbs="['首页', '分类管理']">
    <div class="toolbar">
      <a-input v-model="kw" :style="{ width: '260px' }" placeholder="按分类名称过滤" allow-clear/>
      <a-button type="primary" status="warning" style="margin-left: 14px" @click="showAddModal">
        <icon-plus/> 新增分类
      </a-button>
      <a-button type="primary" style="margin-left: 8px" @click="loadAll">刷新</a-button>
    </div>

    <a-row :gutter="14">
      <a-col :span="6" v-for="cat in filtered" :key="cat.cid" style="margin-bottom: 14px">
        <a-card class="cat-card" :bordered="false">
          <div class="cat-card-head">
            <a-tag color="orangered">{{ cat.cid }}</a-tag>
            <a-space size="mini">
              <a-button shape="circle" size="mini" @click="showEditModal(cat)"><icon-edit/></a-button>
              <a-popconfirm content="确定删除此分类?" @ok="onDelete(cat.cid)">
                <a-button shape="circle" size="mini" status="danger"><icon-delete/></a-button>
              </a-popconfirm>
            </a-space>
          </div>
          <h3 class="cat-name">{{ cat.cname }}</h3>
          <p class="cat-desc">{{ cat.cdesc || '暂无描述' }}</p>
          <div class="cat-footer">
            <icon-book/>
            <span>{{ cat.bookCount || 0 }} 本图书</span>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-empty v-if="filtered.length === 0" description="暂无分类"/>

    <a-modal v-model:visible="modalVisible" :title="editing ? '编辑分类' : '新增分类'"
             @cancel="modalVisible=false" @ok="onSubmit">
      <a-form :model="form" :rules="rules" ref="formRef" auto-label-width>
        <a-form-item field="cid" label="分类编号">
          <a-input v-model="form.cid" :disabled="editing" placeholder="如 CS / MATH"/>
        </a-form-item>
        <a-form-item field="cname" label="分类名称">
          <a-input v-model="form.cname" placeholder="如 计算机技术"/>
        </a-form-item>
        <a-form-item field="cdesc" label="描述">
          <a-textarea v-model="form.cdesc" placeholder="可选描述" :max-length="200"/>
        </a-form-item>
      </a-form>
    </a-modal>
  </AppLayout>
</template>

<script>
import {defineComponent} from "vue";
import {Message} from "@arco-design/web-vue";
import {IconPlus, IconEdit, IconDelete, IconBook} from "@arco-design/web-vue/es/icon";
import AppLayout from "@/components/AppLayout.vue";
import {loadCategories, addCategory, updateCategory, deleteCategory} from "@/api/CategoryRequest";

export default defineComponent({
  name: "categories",
  components: {AppLayout, IconPlus, IconEdit, IconDelete, IconBook},
  data() {
    return {
      kw: "",
      list: [],
      modalVisible: false,
      editing: false,
      form: {cid: "", cname: "", cdesc: ""},
      rules: {
        cid: [{required: true, message: "请输入分类编号"}],
        cname: [{required: true, message: "请输入分类名称"}],
      },
    };
  },
  computed: {
    filtered() {
      if (!this.kw) return this.list;
      const k = this.kw.toLowerCase();
      return this.list.filter(c =>
          (c.cid || "").toLowerCase().includes(k) ||
          (c.cname || "").toLowerCase().includes(k));
    },
  },
  methods: {
    loadAll() {
      loadCategories().then(res => {
        if (res.data.status === true) this.list = res.data.data || [];
      }).catch(() => Message.error("加载失败"));
    },
    showAddModal() {
      this.editing = false;
      this.form = {cid: "", cname: "", cdesc: ""};
      this.modalVisible = true;
    },
    showEditModal(cat) {
      this.editing = true;
      this.form = {cid: cat.cid, cname: cat.cname, cdesc: cat.cdesc || ""};
      this.modalVisible = true;
    },
    onSubmit() {
      this.$refs.formRef.validate().then(errors => {
        if (errors) return;
        const action = this.editing ? updateCategory(this.form) : addCategory(this.form);
        action.then(res => {
          if (res.data.status === true) {
            Message.success(this.editing ? "更新成功" : "新增成功");
            this.modalVisible = false;
            this.loadAll();
          } else {
            Message.error(res.data.msg || "操作失败");
          }
        }).catch(() => Message.error("请求失败"));
      });
    },
    onDelete(cid) {
      deleteCategory(cid).then(res => {
        if (res.data.status === true) {
          Message.success("删除成功");
          this.loadAll();
        } else {
          Message.error(res.data.msg || "删除失败");
        }
      });
    },
  },
  mounted() {
    this.loadAll();
  },
});
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.cat-card {
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E8E4DF;
  transition: all 0.25s;
  height: 100%;
}

.cat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.06);
  border-color: #D4A574;
}

.cat-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.cat-name {
  font-size: 18px;
  font-weight: 700;
  color: #1A1A1A;
  margin: 0 0 8px;
}

.cat-desc {
  font-size: 13px;
  color: #9B9590;
  min-height: 36px;
  margin-bottom: 14px;
  line-height: 1.5;
}

.cat-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #CC785C;
  font-weight: 500;
  padding-top: 10px;
  border-top: 1px dashed #EDE8E3;
}
</style>
