<template>
  <AppLayout :breadcrumbs="['首页', '消息中心']">
    <div class="toolbar">
      <a-button type="primary" @click="loadAll">
        <icon-refresh/> 刷新
      </a-button>
      <a-button style="margin-left: 8px" :disabled="list.every(m => m.readFlag)" @click="onMarkAllRead">
        <icon-check-circle/> 全部标为已读
      </a-button>
      <a-tag color="orangered" style="margin-left: auto">未读 {{ unreadCount }} 条</a-tag>
    </div>

    <a-empty v-if="list.length === 0" description="暂无站内消息" style="margin-top: 60px"/>

    <a-list :data="list" :pagination-props="{pageSize: 10}" :bordered="false">
      <template #item="{item}">
        <a-list-item :key="item.mid" class="msg-item" :class="{unread: !item.readFlag}">
          <a-list-item-meta>
            <template #avatar>
              <a-avatar shape="square" :style="{background: typeColor(item.type)}">
                <component :is="typeIcon(item.type)" :size="20"/>
              </a-avatar>
            </template>
            <template #title>
              <span class="msg-title">{{ item.title }}</span>
              <a-badge v-if="!item.readFlag" status="processing" text="未读" style="margin-left: 8px"/>
              <a-tag :color="typeTagColor(item.type)" size="small" style="margin-left: 6px">{{ typeName(item.type) }}</a-tag>
            </template>
            <template #description>
              <p class="msg-content">{{ item.content }}</p>
              <p class="msg-meta"><icon-clock-circle/> {{ formatTime(item.createtime) }}</p>
            </template>
          </a-list-item-meta>
          <template #actions>
            <a-button v-if="!item.readFlag" size="small" @click="onRead(item)">
              <icon-check/> 标为已读
            </a-button>
            <a-popconfirm content="确定删除该消息?" @ok="onDelete(item.mid)">
              <a-button size="small" status="danger"><icon-delete/> 删除</a-button>
            </a-popconfirm>
          </template>
        </a-list-item>
      </template>
    </a-list>
  </AppLayout>
</template>

<script>
import {defineComponent} from "vue";
import {Message} from "@arco-design/web-vue";
import {
  IconRefresh, IconCheck, IconCheckCircle, IconClockCircle, IconDelete,
  IconNotification, IconExclamationCircle, IconBook, IconInfoCircle,
} from "@arco-design/web-vue/es/icon";
import AppLayout from "@/components/AppLayout.vue";
import {loadMyMessages, markRead, markAllRead, deleteMessage, loadUnreadCount} from "@/api/MessageRequest";

export default defineComponent({
  name: "messages",
  components: {
    AppLayout, IconRefresh, IconCheck, IconCheckCircle, IconClockCircle, IconDelete,
    IconNotification, IconExclamationCircle, IconBook, IconInfoCircle,
  },
  data() {
    return {list: [], unreadCount: 0};
  },
  methods: {
    formatTime(t) {
      if (!t) return "";
      return String(t).replace("T", " ").substring(0, 19);
    },
    typeName(t) {
      const map = {system: "系统", reserve: "预约", overdue: "逾期", notice: "公告"};
      return map[t] || "其他";
    },
    typeIcon(t) {
      const map = {
        system: "IconInfoCircle", reserve: "IconBook",
        overdue: "IconExclamationCircle", notice: "IconNotification",
      };
      return map[t] || "IconInfoCircle";
    },
    typeColor(t) {
      const map = {
        system: "#5B8C5A", reserve: "#CC785C",
        overdue: "#C45B4A", notice: "#C49A3C",
      };
      return map[t] || "#9B9590";
    },
    typeTagColor(t) {
      const map = {system: "green", reserve: "orangered", overdue: "red", notice: "orange"};
      return map[t] || "gray";
    },
    loadAll() {
      loadMyMessages().then(res => {
        if (res.data.status === true) this.list = res.data.data || [];
      }).catch(() => Message.error("加载失败"));
      loadUnreadCount().then(res => {
        if (res.data.status === true) this.unreadCount = res.data.data.count || 0;
      });
    },
    onRead(item) {
      markRead(item.mid).then(res => {
        if (res.data.status === true) this.loadAll();
      });
    },
    onMarkAllRead() {
      markAllRead().then(res => {
        if (res.data.status === true) {
          Message.success("已全部标为已读");
          this.loadAll();
        }
      });
    },
    onDelete(mid) {
      deleteMessage(mid).then(res => {
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

.msg-item {
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E8E4DF;
  margin-bottom: 12px;
  padding: 16px 20px;
  transition: all 0.2s;
}

.msg-item.unread {
  border-color: #D4A574;
  background: #FFFBF5;
}

.msg-item:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}

.msg-title {
  font-weight: 600;
  font-size: 16px;
  color: #1A1A1A;
}

.msg-content {
  font-size: 13px;
  color: #6B6560;
  line-height: 1.7;
  margin: 6px 0 8px;
}

.msg-meta {
  font-size: 12px;
  color: #9B9590;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
}
</style>
