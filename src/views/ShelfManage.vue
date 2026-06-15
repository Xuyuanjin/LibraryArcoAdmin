<template>
  <AppLayout :breadcrumbs="['首页', '书架管理']">
    <div class="toolbar">
      <a-input v-model="searchInput" :style="{ width: '260px' }" placeholder="请输入书架号搜索" allow-clear/>
      <a-button type="primary" status="success" style="margin-left: 8px" @click="onSearch">搜索</a-button>
      <a-button type="primary" status="warning" style="margin-left: 14px" @click="showAddModal">新增书架</a-button>
      <a-button type="primary" style="margin-left: 8px" @click="loadAll">查询全部</a-button>
    </div>

    <a-table :columns="columns" :data="listData" :pagination="pagination" row-key="bookshelfnum">
      <template #optional="{ record }">
        <a-button status="warning" @click="showEditModal(record)">编辑</a-button>
        <a-popconfirm content="确定删除该书架?" @ok="onDelete(record.bookshelfnum)">
          <a-button status="danger" style="margin-left: 8px">删除</a-button>
        </a-popconfirm>
      </template>
    </a-table>

    <a-modal v-model:visible="modalVisible" :title="editing ? '编辑书架' : '新增书架'" @cancel="modalVisible=false" @ok="onSubmit">
      <a-form :model="form" :rules="rules" ref="formRef" auto-label-width>
        <a-form-item field="bookshelfnum" label="书架号">
          <a-input v-model="form.bookshelfnum" :disabled="editing" placeholder="请输入书架号"/>
        </a-form-item>
        <a-form-item field="bookshelfname" label="书架名">
          <a-input v-model="form.bookshelfname" placeholder="请输入书架名"/>
        </a-form-item>
        <a-form-item field="position" label="位置">
          <a-input v-model="form.position" placeholder="请输入位置"/>
        </a-form-item>
      </a-form>
    </a-modal>
  </AppLayout>
</template>

<script>
import {defineComponent} from "vue";
import {Message} from "@arco-design/web-vue";
import AppLayout from "@/components/AppLayout.vue";
import {loadShelves, getShelfByNum, addShelf, updateShelf, deleteShelf} from "@/api/ShelfRequest";

export default defineComponent({
  name: "shelves",
  components: {AppLayout},
  data() {
    return {
      listData: [],
      searchInput: "",
      modalVisible: false,
      editing: false,
      form: {bookshelfnum: "", bookshelfname: "", position: ""},
      rules: {
        bookshelfnum: [{required: true, message: "请输入书架号"}],
        bookshelfname: [{required: true, message: "请输入书架名"}],
      },
      columns: [
        {title: "书架号", dataIndex: "bookshelfnum"},
        {title: "书架名", dataIndex: "bookshelfname"},
        {title: "位置", dataIndex: "position"},
        {title: "操作", slotName: "optional", width: 180},
      ],
      pagination: {showTotal: true, showJumper: true, pageSize: 10, sizeCanChange: true},
    };
  },
  methods: {
    loadAll() {
      loadShelves().then(res => {
        if (res.data.status === true) this.listData = res.data.data || [];
      }).catch(() => Message.error("加载失败"));
    },
    onSearch() {
      if (!this.searchInput) {
        this.loadAll();
        return;
      }
      getShelfByNum(this.searchInput).then(res => {
        this.listData = res.data.data || [];
      }).catch(() => Message.error("查询失败"));
    },
    showAddModal() {
      this.editing = false;
      this.form = {bookshelfnum: "", bookshelfname: "", position: ""};
      this.modalVisible = true;
    },
    showEditModal(record) {
      this.editing = true;
      this.form = {...record};
      this.modalVisible = true;
    },
    onSubmit() {
      this.$refs.formRef.validate().then(errors => {
        if (errors) return;
        const action = this.editing ? updateShelf(this.form) : addShelf(this.form);
        action.then(res => {
          if (res.data.status === true) {
            Message.success(this.editing ? "更新成功" : "新增成功");
            this.modalVisible = false;
            this.loadAll();
          } else {
            Message.error("操作失败");
          }
        }).catch(() => Message.error("请求失败"));
      });
    },
    onDelete(num) {
      deleteShelf(num).then(res => {
        if (res.data.status === true) {
          Message.success("删除成功");
          this.loadAll();
        } else {
          Message.error("删除失败");
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
</style>
