<template>
  <AppLayout :breadcrumbs="['首页', isAdmin ? '借阅管理' : '我的借阅']">
    <div class="toolbar">
      <a-button v-if="isAdmin" type="primary" status="success" @click="showBorrowModal">借 书</a-button>
      <a-button v-if="!isAdmin" type="primary" status="success" @click="$router.push({name:'bookstore'})">
        <icon-book/> 去借书
      </a-button>
      <a-button type="primary" style="margin-left: 10px" @click="loadAll">
        {{ isAdmin ? '查询全部借阅记录' : '查询我的借阅记录' }}
      </a-button>
      <a-tag color="orange" style="margin-left: 14px">
        默认借期 30 天，逾期 0.5 元/天，最多续借 2 次
      </a-tag>
    </div>

    <a-table :columns="columns" :data="listData" :pagination="pagination" row-key="jid">
      <template #status="{ record }">
        <a-tag v-if="record.backdate" color="green">已还</a-tag>
        <a-tag v-else-if="isOverdue(record)" color="red">逾期</a-tag>
        <a-tag v-else color="blue">借出</a-tag>
      </template>
      <template #renewCount="{ record }">
        <a-tag size="small" :color="record.renewCount >= 2 ? 'red' : 'gray'">
          {{ record.renewCount || 0 }}/2
        </a-tag>
      </template>
      <template #optional="{ record }">
        <a-button v-if="!record.backdate" status="warning" size="small" @click="onReturn(record)">归还</a-button>
        <a-button v-if="!record.backdate && (record.renewCount || 0) < 2 && !isOverdue(record)"
                  size="small" style="margin-left: 6px" @click="onRenew(record)">续借</a-button>
        <a-popconfirm v-if="isAdmin" content="确定删除这条记录?" @ok="onDelete(record.jid)">
          <a-button status="danger" size="small" style="margin-left: 6px">删除</a-button>
        </a-popconfirm>
      </template>
    </a-table>

    <a-modal v-model:visible="borrowModalVisible" title="借书登记"
             @cancel="borrowModalVisible=false" @ok="onBorrowSubmit">
      <a-form :model="borrowForm" :rules="rules" ref="borrowFormRef" auto-label-width>
        <a-form-item field="uid" label="读者ID">
          <a-input v-model="borrowForm.uid" :disabled="!isAdmin" placeholder="请输入读者ID"/>
        </a-form-item>
        <a-form-item field="bisbn" label="书号ISBN">
          <a-input v-model="borrowForm.bisbn" placeholder="请输入要借阅的书号" allow-clear/>
        </a-form-item>
      </a-form>
    </a-modal>
  </AppLayout>
</template>

<script>
import {defineComponent} from "vue";
import {Message} from "@arco-design/web-vue";
import {IconBook} from "@arco-design/web-vue/es/icon";
import AppLayout from "@/components/AppLayout.vue";
import {loadBorrows, loadMyBorrows, borrowBook, returnBook, renewBorrow, deleteBorrow} from "@/api/BorrowRequest";

export default defineComponent({
  name: "borrows",
  components: {AppLayout, IconBook},
  data() {
    return {
      listData: [],
      borrowModalVisible: false,
      borrowForm: {uid: "", bisbn: ""},
      rules: {
        uid: [{required: true, message: "请输入读者ID"}],
        bisbn: [{required: true, message: "请输入书号"}],
      },
      columns: [
        {title: "记录ID", dataIndex: "jid", width: 80},
        {title: "读者ID", dataIndex: "uid", width: 80},
        {title: "读者", dataIndex: "realName", width: 100},
        {title: "书号", dataIndex: "bisbn", width: 80},
        {title: "书名", dataIndex: "bname", ellipsis: true, tooltip: true},
        {title: "借阅时间", dataIndex: "borrowingdate", width: 165, render: ({record}) => this.fmt(record.borrowingdate)},
        {title: "应还时间", dataIndex: "duedate", width: 165, render: ({record}) => this.fmt(record.duedate)},
        {title: "归还时间", dataIndex: "backdate", width: 165, render: ({record}) => this.fmt(record.backdate)},
        {title: "罚金(元)", dataIndex: "finenumber", width: 90},
        {title: "续借", slotName: "renewCount", width: 80},
        {title: "状态", slotName: "status", width: 80},
        {title: "操作", slotName: "optional", width: 220},
      ],
      pagination: {showTotal: true, showJumper: true, pageSize: 10, sizeCanChange: true},
    };
  },
  computed: {
    isAdmin() { return this.$store.state.role === "admin"; },
    currentUid() { return this.$store.state.uid; },
  },
  methods: {
    fmt(t) {
      if (!t) return "—";
      return String(t).replace("T", " ").substring(0, 19);
    },
    isOverdue(record) {
      if (record.backdate) return false;
      if (!record.duedate) return false;
      return new Date(record.duedate) < new Date();
    },
    loadAll() {
      const req = this.isAdmin ? loadBorrows() : loadMyBorrows(this.currentUid);
      req.then(res => {
        if (res.data.status === true) this.listData = res.data.data || [];
      }).catch(() => Message.error("加载借阅记录失败"));
    },
    showBorrowModal() {
      this.borrowForm = {uid: this.isAdmin ? "" : this.currentUid, bisbn: ""};
      this.borrowModalVisible = true;
    },
    onBorrowSubmit() {
      this.$refs.borrowFormRef.validate().then(errors => {
        if (errors) return;
        borrowBook(this.borrowForm.uid, this.borrowForm.bisbn).then(res => {
          if (res.data.status === true) {
            Message.success("借阅成功");
            this.borrowModalVisible = false;
            this.loadAll();
          } else {
            Message.error(res.data.msg || "借阅失败");
          }
        }).catch(() => Message.error("借阅请求失败"));
      });
    },
    onReturn(record) {
      returnBook(record.jid).then(res => {
        if (res.data.status === true) {
          Message.success(res.data.data || "归还成功");
          this.loadAll();
        } else {
          Message.error(res.data.msg || "归还失败");
        }
      }).catch(() => Message.error("归还请求失败"));
    },
    onRenew(record) {
      renewBorrow(record.jid).then(res => {
        if (res.data.status === true) {
          Message.success(res.data.data || "续借成功");
          this.loadAll();
        } else {
          Message.error(res.data.msg || "续借失败");
        }
      }).catch(() => Message.error("续借请求失败"));
    },
    onDelete(jid) {
      deleteBorrow(jid).then(res => {
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
