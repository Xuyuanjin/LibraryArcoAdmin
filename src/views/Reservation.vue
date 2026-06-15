<template>
  <AppLayout :breadcrumbs="['首页', isAdmin ? '预约管理' : '我的预约']">
    <div class="toolbar">
      <a-button type="primary" @click="loadAll">
        <icon-refresh/> 刷新
      </a-button>
      <a-space style="margin-left: 14px">
        <a-tag color="orange">归还后会通知队首读者</a-tag>
        <a-tag color="blue">已通知预约需在 3 天内借阅</a-tag>
        <a-tag color="gray">超时预约将自动取消并通知下一位</a-tag>
      </a-space>
    </div>

    <a-table :columns="columns" :data="list" :pagination="{pageSize: 10, showTotal: true}" row-key="rid">
      <template #book="{ record }">
        <div class="book-cell">
          <img v-if="record.bimage" :src="record.bimage" class="book-cover-mini"/>
          <div v-else class="book-cover-mini placeholder"><icon-book :size="18"/></div>
          <span>{{ record.bname || record.bisbn }}</span>
        </div>
      </template>
      <template #status="{ record }">
        <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
      </template>
      <template #duration="{ record }">
        <span v-if="record.status === '等待中'" style="color: #9B9590">
          {{ calcWaitingDays(record.reservetime) }}天
        </span>
        <span v-else-if="record.status === '已通知'" :style="{color: calcRemainingDays(record.notifytime) <= 1 ? '#C45B4A' : '#C49A3C'}">
          剩{{ calcRemainingDays(record.notifytime) }}天
        </span>
        <span v-else style="color: #D4CFC8">—</span>
      </template>
      <template #optional="{ record }">
        <a-popconfirm v-if="record.status === '等待中' || record.status === '已通知'" content="确定取消此预约?" @ok="onCancel(record.rid)">
          <a-button size="small" status="warning">取消</a-button>
        </a-popconfirm>
        <a-popconfirm v-if="isAdmin" content="确定删除这条预约记录?" @ok="onDelete(record.rid)">
          <a-button size="small" status="danger" style="margin-left: 6px">删除</a-button>
        </a-popconfirm>
      </template>
    </a-table>
  </AppLayout>
</template>

<script>
import {defineComponent} from "vue";
import {Message} from "@arco-design/web-vue";
import {IconRefresh, IconBook} from "@arco-design/web-vue/es/icon";
import AppLayout from "@/components/AppLayout.vue";
import {loadMyReservations, loadAllReservations, cancelReservation, deleteReservation} from "@/api/ReservationRequest";

export default defineComponent({
  name: "reservations",
  components: {AppLayout, IconRefresh, IconBook},
  data() {
    return {list: []};
  },
  computed: {
    isAdmin() {
      return this.$store.state.role === "admin";
    },
    columns() {
      const base = [
        {title: "ID", dataIndex: "rid", width: 80},
        {title: "图书", slotName: "book"},
        {title: "预约时间", dataIndex: "reservetime", width: 170, render: ({record}) => this.fmt(record.reservetime)},
        {title: "通知时间", dataIndex: "notifytime", width: 170, render: ({record}) => this.fmt(record.notifytime)},
        {title: "等待/剩余", slotName: "duration", width: 120},
        {title: "状态", slotName: "status", width: 90},
        {title: "操作", slotName: "optional", width: 180},
      ];
      if (this.isAdmin) {
        base.splice(1, 0, {title: "读者", dataIndex: "realName", width: 120});
      }
      return base;
    },
  },
  methods: {
    fmt(t) {
      if (!t) return "—";
      return String(t).replace("T", " ").substring(0, 19);
    },
    statusColor(s) {
      const map = {等待中: "blue", 已通知: "orange", 已完成: "green", 已取消: "gray"};
      return map[s] || "gray";
    },
    calcWaitingDays(reservetime) {
      if (!reservetime) return 0;
      const start = new Date(reservetime);
      const now = new Date();
      return Math.floor((now - start) / (1000 * 60 * 60 * 24));
    },
    calcRemainingDays(notifytime) {
      if (!notifytime) return 3;
      const notifyDate = new Date(notifytime);
      const deadline = new Date(notifyDate.getTime() + 3 * 24 * 60 * 60 * 1000);
      const now = new Date();
      const remaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      return Math.max(0, remaining);
    },
    loadAll() {
      const req = this.isAdmin ? loadAllReservations() : loadMyReservations();
      req.then(res => {
        if (res.data.status === true) this.list = res.data.data || [];
        else Message.error(res.data.msg || "加载失败");
      }).catch(() => Message.error("加载失败"));
    },
    onCancel(rid) {
      cancelReservation(rid).then(res => {
        if (res.data.status === true) {
          Message.success(res.data.data || "已取消");
          this.loadAll();
        } else {
          Message.error(res.data.msg || "取消失败");
        }
      });
    },
    onDelete(rid) {
      deleteReservation(rid).then(res => {
        if (res.data.status === true) {
          Message.success("已删除");
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

.book-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.book-cover-mini {
  width: 36px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.book-cover-mini.placeholder {
  background: #F5F0EB;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C49A7A;
}
</style>
