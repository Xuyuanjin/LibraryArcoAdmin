<template>
  <AppLayout :breadcrumbs="['首页', '公告管理']">
    <div class="toolbar">
      <a-input v-model="kw" :style="{ width: '300px' }" placeholder="按标题/内容搜索" allow-clear/>
      <a-button v-if="isAdmin" type="primary" status="warning" style="margin-left: 14px" @click="showAddModal">
        <icon-plus/> 发布公告
      </a-button>
      <a-button type="primary" style="margin-left: 8px" @click="loadAll">刷新</a-button>
    </div>

    <a-list :data="filtered" :pagination-props="{ pageSize: 8 }" :bordered="false">
      <template #item="{ item }">
        <a-list-item :key="item.nid" class="notice-item">
          <a-list-item-meta>
            <template #avatar>
              <a-avatar shape="square" :style="{background: item.status === 1 ? '#CC785C' : '#9B9590'}">
                <icon-notification :size="20"/>
              </a-avatar>
            </template>
            <template #title>
              <span class="notice-title">{{ item.title }}</span>
              <a-tag v-if="item.status === 1" color="green" size="small" style="margin-left: 8px">发布中</a-tag>
              <a-tag v-else color="gray" size="small" style="margin-left: 8px">已下线</a-tag>
            </template>
            <template #description>
              <p class="notice-content">{{ item.content }}</p>
              <p class="notice-meta">
                <icon-user/> {{ item.publisher }}
                <icon-clock-circle style="margin-left: 12px"/> {{ formatTime(item.publishtime) }}
              </p>
            </template>
          </a-list-item-meta>
          <template #actions v-if="isAdmin">
            <a-button size="small" @click="showEditModal(item)">
              <icon-edit/> 编辑
            </a-button>
            <a-button v-if="item.status === 1" size="small" status="warning" @click="toggleStatus(item, 0)">
              <icon-eye-invisible/> 下线
            </a-button>
            <a-button v-else size="small" status="success" @click="toggleStatus(item, 1)">
              <icon-eye/> 上线
            </a-button>
            <a-popconfirm content="确定删除此公告?" @ok="onDelete(item.nid)">
              <a-button size="small" status="danger"><icon-delete/> 删除</a-button>
            </a-popconfirm>
          </template>
        </a-list-item>
      </template>
    </a-list>

    <a-modal v-model:visible="modalVisible" :title="editing ? '编辑公告' : '发布公告'" width="640px"
             @cancel="modalVisible=false" @ok="onSubmit">
      <a-form :model="form" :rules="rules" ref="formRef" auto-label-width>
        <a-form-item field="title" label="标题">
          <a-input v-model="form.title" placeholder="公告标题"/>
        </a-form-item>
        <a-form-item field="content" label="内容">
          <a-textarea v-model="form.content" placeholder="公告正文" :auto-size="{minRows: 5, maxRows: 12}"/>
        </a-form-item>
        <a-form-item field="status" label="状态" v-if="editing">
          <a-radio-group v-model="form.status">
            <a-radio :value="1">发布中</a-radio>
            <a-radio :value="0">已下线</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </AppLayout>
</template>

<script>
import {defineComponent} from "vue";
import {Message} from "@arco-design/web-vue";
import {
  IconPlus, IconEdit, IconDelete, IconNotification,
  IconUser, IconClockCircle, IconEye, IconEyeInvisible
} from "@arco-design/web-vue/es/icon";
import AppLayout from "@/components/AppLayout.vue";
import {loadNotices, addNotice, updateNotice, deleteNotice} from "@/api/NoticeRequest";

export default defineComponent({
  name: "notices",
  components: {
    AppLayout, IconPlus, IconEdit, IconDelete, IconNotification,
    IconUser, IconClockCircle, IconEye, IconEyeInvisible,
  },
  data() {
    return {
      kw: "",
      list: [],
      modalVisible: false,
      editing: false,
      form: {nid: null, title: "", content: "", status: 1},
      rules: {
        title: [{required: true, message: "请输入标题"}],
        content: [{required: true, message: "请输入内容"}],
      },
    };
  },
  computed: {
    isAdmin() {
      return this.$store.state.role === "admin";
    },
    filtered() {
      if (!this.kw) return this.list;
      const k = this.kw.toLowerCase();
      return this.list.filter(n =>
          (n.title || "").toLowerCase().includes(k) ||
          (n.content || "").toLowerCase().includes(k));
    },
  },
  methods: {
    formatTime(t) {
      if (!t) return "";
      return String(t).replace("T", " ").substring(0, 19);
    },
    loadAll() {
      loadNotices().then(res => {
        if (res.data.status === true) this.list = res.data.data || [];
      }).catch(() => Message.error("加载失败"));
    },
    showAddModal() {
      this.editing = false;
      this.form = {nid: null, title: "", content: "", status: 1};
      this.modalVisible = true;
    },
    showEditModal(item) {
      this.editing = true;
      this.form = {nid: item.nid, title: item.title, content: item.content, status: item.status};
      this.modalVisible = true;
    },
    onSubmit() {
      this.$refs.formRef.validate().then(errors => {
        if (errors) return;
        const action = this.editing ? updateNotice(this.form) : addNotice(this.form);
        action.then(res => {
          if (res.data.status === true) {
            Message.success(this.editing ? "更新成功" : "发布成功");
            this.modalVisible = false;
            this.loadAll();
          } else {
            Message.error(res.data.msg || "操作失败");
          }
        }).catch(() => Message.error("请求失败"));
      });
    },
    toggleStatus(item, target) {
      updateNotice({...item, status: target}).then(res => {
        if (res.data.status === true) {
          Message.success(target === 1 ? "已上线" : "已下线");
          this.loadAll();
        }
      });
    },
    onDelete(nid) {
      deleteNotice(nid).then(res => {
        if (res.data.status === true) {
          Message.success("删除成功");
          this.loadAll();
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

.notice-item {
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E8E4DF;
  margin-bottom: 12px;
  padding: 16px 20px;
  transition: all 0.2s;
}

.notice-item:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
  border-color: #D4A574;
}

.notice-title {
  font-weight: 600;
  font-size: 16px;
  color: #1A1A1A;
}

.notice-content {
  font-size: 13px;
  color: #6B6560;
  line-height: 1.7;
  margin: 6px 0 8px;
}

.notice-meta {
  font-size: 12px;
  color: #9B9590;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
