<template>
  <AppLayout :breadcrumbs="['首页', '仪表盘']">
    <!-- 顶部欢迎区 + 快捷操作 -->
    <a-card class="welcome-card" :bordered="false">
      <a-row :align="'center'">
        <a-col :span="14">
          <h2 class="welcome-title">欢迎回来，{{ realName || userName }} 👋</h2>
          <p class="welcome-sub">这里是智能图书资源管理与服务平台仪表盘，关注核心运营指标与最新动态。</p>
        </a-col>
        <a-col :span="10" style="text-align: right">
          <a-space>
            <a-button type="primary" @click="exportFile('books')">
              <icon-download/> 导出图书
            </a-button>
            <a-button type="primary" status="success" @click="exportFile('borrows')">
              <icon-download/> 导出借阅
            </a-button>
            <a-button status="warning" @click="onScanOverdue" :loading="scanning">
              <icon-exclamation-circle/> 扫描逾期
            </a-button>
            <a-button @click="loadDashboardData">
              <icon-refresh/> 刷新
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 统计卡片 -->
    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="cards.length === 5 ? 4 : 6" v-for="card in cards" :key="card.title" :style="{flex: cards.length === 5 ? '0 0 20%' : 'auto'}">
        <a-card class="stat-card" :bordered="false">
          <div class="stat-card-inner">
            <div class="stat-icon" :style="{background: card.bgColor}">
              <component :is="card.icon" :style="{color: card.color, fontSize: '24px'}"/>
            </div>
            <div class="stat-info">
              <div class="stat-value" :style="{color: card.color}">{{ card.value }}</div>
              <div class="stat-title">{{ card.title }}</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px">
      <!-- 借阅趋势条形图 -->
      <a-col :span="14">
        <a-card :bordered="false" class="dashboard-card">
          <template #title><span class="card-title">📈 借阅趋势（近 6 月）</span></template>
          <div v-if="borrowTrend.length === 0" class="empty-state">暂无趋势数据</div>
          <div v-else class="trend-bars">
            <div class="trend-bar-item" v-for="item in borrowTrend" :key="item.month">
              <div class="bar-label">{{ item.month }}</div>
              <div class="bar-track">
                <div class="bar-fill" :style="{width: getBarWidth(item.count) + '%'}"></div>
              </div>
              <div class="bar-value">{{ item.count }}</div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 借阅状态分布 -->
      <a-col :span="10">
        <a-card :bordered="false" class="dashboard-card">
          <template #title><span class="card-title">📊 借阅状态</span></template>
          <div class="status-chart">
            <div class="status-item" v-for="item in statusItems" :key="item.label">
              <div class="status-header">
                <span class="status-dot" :style="{background: item.color}"></span>
                <span class="status-label">{{ item.label }}</span>
                <span class="status-count">{{ item.value }}</span>
              </div>
              <a-progress :percent="getStatusPercent(item.value)" :color="item.color" :show-text="false" size="large"/>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px">
      <!-- 公告 Top -->
      <a-col :span="12">
        <a-card :bordered="false" class="dashboard-card">
          <template #title><span class="card-title">📢 最新公告</span></template>
          <template #extra>
            <a-link @click="$router.push({name: 'notices'})">查看全部</a-link>
          </template>
          <a-empty v-if="notices.length === 0" description="暂无公告"/>
          <div v-else class="notice-list">
            <div class="notice-row" v-for="n in notices" :key="n.nid">
              <icon-notification style="color: #CC785C; flex-shrink: 0"/>
              <div class="notice-row-body">
                <p class="notice-row-title">{{ n.title }}</p>
                <p class="notice-row-time">{{ formatTime(n.publishtime) }} · {{ n.publisher }}</p>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 热门图书 -->
      <a-col :span="12">
        <a-card :bordered="false" class="dashboard-card">
          <template #title><span class="card-title">🔥 热门图书 Top 10</span></template>
          <a-table :columns="topBookCols" :data="topBooks" :pagination="false" :bordered="false" size="small">
            <template #rank="{ rowIndex }">
              <a-tag :color="rowIndex < 3 ? 'orangered' : 'gray'" size="small">{{ rowIndex + 1 }}</a-tag>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin: 16px 0">
      <!-- 分类分布 -->
      <a-col :span="12">
        <a-card :bordered="false" class="dashboard-card">
          <template #title><span class="card-title">📚 图书分类分布</span></template>
          <a-empty v-if="categoryDist.length === 0" description="暂无分类数据"/>
          <div v-else class="trend-bars">
            <div class="trend-bar-item" v-for="item in categoryDist" :key="item.cname">
              <div class="bar-label">{{ item.cname }}</div>
              <div class="bar-track">
                <div class="bar-fill cat-fill" :style="{width: getCatBarWidth(item.count) + '%'}"></div>
              </div>
              <div class="bar-value">{{ item.count }}</div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 用户角色分布 -->
      <a-col :span="12">
        <a-card :bordered="false" class="dashboard-card">
          <template #title><span class="card-title">👥 用户角色分布</span></template>
          <div class="role-chart">
            <div class="role-item" v-for="item in userRoles" :key="item.role">
              <a-avatar :size="56" :style="{background: item.role === 'admin' ? '#CC785C' : '#5B8C5A'}">
                <icon-user-group :size="26"/>
              </a-avatar>
              <div class="role-info">
                <span class="role-name">{{ item.role === 'admin' ? '管理员' : '读者' }}</span>
                <span class="role-count">{{ item.count }} 人</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </AppLayout>
</template>

<script>
import {defineComponent} from "vue";
import {Message} from "@arco-design/web-vue";
import {
  IconBook, IconUserGroup, IconCalendarClock, IconExclamationCircle,
  IconDownload, IconRefresh, IconNotification, IconClockCircle,
} from "@arco-design/web-vue/es/icon";
import AppLayout from "@/components/AppLayout.vue";
import {loadDashboard} from "@/api/StatsRequest";
import {scanOverdue} from "@/api/StatsRequest";
import {loadTopNotices} from "@/api/NoticeRequest";
import {exportBooks, exportBorrows, triggerDownload} from "@/api/ExportRequest";

export default defineComponent({
  name: "Home",
  components: {
    AppLayout, IconBook, IconUserGroup, IconCalendarClock, IconExclamationCircle,
    IconDownload, IconRefresh, IconNotification, IconClockCircle,
  },
  data() {
    return {
      cards: [
        {title: "图书种类", value: 0, color: "#CC785C", bgColor: "rgba(204,120,92,0.1)", icon: "IconBook", key: "bookCount"},
        {title: "注册用户", value: 0, color: "#5B8C5A", bgColor: "rgba(91,140,90,0.1)", icon: "IconUserGroup", key: "userCount"},
        {title: "当前在借", value: 0, color: "#C49A3C", bgColor: "rgba(196,154,60,0.1)", icon: "IconCalendarClock", key: "borrowingCount"},
        {title: "逾期未还", value: 0, color: "#C45B4A", bgColor: "rgba(196,91,74,0.1)", icon: "IconExclamationCircle", key: "overdueCount"},
        {title: "等待预约", value: 0, color: "#7B5BC4", bgColor: "rgba(123,91,196,0.1)", icon: "IconClockCircle", key: "waitingReservationCount"},
      ],
      borrowTrend: [],
      topBooks: [],
      borrowStatus: {},
      userRoles: [],
      categoryDist: [],
      notices: [],
      scanning: false,
      topBookCols: [
        {title: "排名", slotName: "rank", width: 60},
        {title: "书名", dataIndex: "bname", ellipsis: true, tooltip: true},
        {title: "借阅次数", dataIndex: "borrowCount", width: 90},
      ],
    };
  },
  computed: {
    userName() { return this.$store.state.userName; },
    realName() { return this.$store.state.realName; },
    statusItems() {
      return [
        {label: "借出中", value: this.borrowStatus.borrowing || 0, color: "#CC785C"},
        {label: "已逾期", value: this.borrowStatus.overdue || 0, color: "#C45B4A"},
        {label: "已归还", value: this.borrowStatus.returned || 0, color: "#5B8C5A"},
      ];
    },
    totalStatus() {
      return (this.borrowStatus.borrowing || 0) + (this.borrowStatus.overdue || 0) + (this.borrowStatus.returned || 0);
    },
  },
  methods: {
    formatTime(t) {
      if (!t) return "";
      return String(t).replace("T", " ").substring(0, 16);
    },
    getBarWidth(count) {
      const max = Math.max(...this.borrowTrend.map(t => t.count), 1);
      return (count / max) * 100;
    },
    getCatBarWidth(count) {
      const max = Math.max(...this.categoryDist.map(t => t.count), 1);
      return (count / max) * 100;
    },
    getStatusPercent(value) {
      if (this.totalStatus === 0) return 0;
      return Math.round((value / this.totalStatus) * 100);
    },
    loadDashboardData() {
      loadDashboard()
          .then(res => {
            if (res.data.status === true) {
              const data = res.data.data;
              this.cards.forEach(c => (c.value = data[c.key] || 0));
              this.borrowTrend = data.borrowTrend || [];
              this.topBooks = data.topBooks || [];
              this.borrowStatus = data.borrowStatus || {};
              this.userRoles = data.userRoles || [];
              this.categoryDist = data.categoryDist || [];
            }
          })
          .catch(() => Message.error("加载仪表盘数据失败"));
      loadTopNotices(5).then(res => {
        if (res.data.status === true) this.notices = res.data.data || [];
      }).catch(() => {});
    },
    exportFile(type) {
      const action = type === "books" ? exportBooks() : exportBorrows();
      action.then(res => {
        const filename = type === "books" ? "books.csv" : "borrows.csv";
        triggerDownload(res.data, filename);
        Message.success("导出已开始下载");
      }).catch(() => Message.error("导出失败"));
    },
    onScanOverdue() {
      this.scanning = true;
      scanOverdue()
          .then(res => {
            if (res.data.status) {
              Message.success(res.data.data || "扫描完成");
              this.loadDashboardData();
            } else {
              Message.error(res.data.msg || "扫描失败");
            }
          })
          .catch(() => Message.error("请求失败"))
          .finally(() => (this.scanning = false));
    },
  },
  mounted() {
    this.loadDashboardData();
  },
});
</script>

<style scoped>
.welcome-card {
  background: linear-gradient(120deg, #FFFFFF 0%, #FAF5F0 100%);
  border-radius: 14px;
}

.welcome-title {
  font-size: 22px;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 6px;
}

.welcome-sub {
  font-size: 13px;
  color: #9B9590;
}

.stat-card {
  margin-bottom: 0;
  border-radius: 12px;
  transition: all 0.3s;
  background: #FFFFFF;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.stat-card-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info { flex: 1; }
.stat-value { font-size: 28px; font-weight: 700; line-height: 1.2; }
.stat-title { font-size: 13px; color: #9B9590; margin-top: 2px; }

.dashboard-card { margin-bottom: 0; }
.card-title { font-size: 15px; font-weight: 600; color: #1A1A1A; }
.empty-state { text-align: center; padding: 40px; color: #9B9590; }

.trend-bars { padding: 8px 0; }

.trend-bar-item {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
}

.bar-label { width: 90px; font-size: 13px; color: #6B6560; flex-shrink: 0; }
.bar-track {
  flex: 1; height: 26px; background: #F5F0EB; border-radius: 13px;
  overflow: hidden; margin: 0 12px;
}
.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #CC785C, #D4A574);
  border-radius: 13px; transition: width 0.6s ease;
}
.cat-fill { background: linear-gradient(90deg, #5B8C5A, #8CB58B); }
.bar-value { width: 30px; font-size: 13px; font-weight: 600; color: #1A1A1A; text-align: right; }

.status-chart { padding: 8px 0; }
.status-item { margin-bottom: 22px; }
.status-header {
  display: flex; align-items: center;
  gap: 8px; margin-bottom: 6px;
}
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.status-label { font-size: 14px; color: #6B6560; }
.status-count { margin-left: auto; font-weight: 600; font-size: 16px; color: #1A1A1A; }

.role-chart {
  display: flex; gap: 48px;
  justify-content: center; padding: 22px 0;
}
.role-item { display: flex; align-items: center; gap: 14px; }
.role-info { display: flex; flex-direction: column; }
.role-name { font-size: 14px; color: #6B6560; }
.role-count { font-size: 22px; font-weight: 700; color: #1A1A1A; }

.notice-list { padding: 4px 0; }
.notice-row {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 0;
  border-bottom: 1px dashed #EDE8E3;
}
.notice-row:last-child { border-bottom: none; }
.notice-row-body { flex: 1; min-width: 0; }
.notice-row-title {
  font-size: 14px; font-weight: 500; color: #1A1A1A;
  margin: 0 0 2px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.notice-row-time { font-size: 12px; color: #9B9590; margin: 0; }
</style>
