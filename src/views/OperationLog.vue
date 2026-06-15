<template>
  <AppLayout :breadcrumbs="['首页', '操作日志']">
    <div class="toolbar">
      <a-input v-model="kw" :style="{ width: '320px' }" placeholder="按用户名/模块/操作类型过滤" allow-clear/>
      <a-select v-model="moduleFilter" :style="{ width: '180px', marginLeft: '12px' }"
                placeholder="按模块筛选" allow-clear>
        <a-option value="">全部模块</a-option>
        <a-option v-for="m in modules" :key="m" :value="m">{{ m }}</a-option>
      </a-select>
      <a-button type="primary" style="margin-left: 12px" @click="loadAll">
        <icon-refresh/> 刷新
      </a-button>
      <a-tag color="orange" style="margin-left: auto">仅显示最近 500 条</a-tag>
    </div>

    <a-table :columns="columns" :data="filtered" :pagination="{pageSize: 12, showTotal: true}" row-key="lid" size="small">
      <template #opType="{ record }">
        <a-tag :color="typeColor(record.opType)" size="small">{{ record.opType }}</a-tag>
      </template>
      <template #opCost="{ record }">
        <span :style="{color: record.opCost > 200 ? '#C45B4A' : '#5B8C5A'}">{{ record.opCost }} ms</span>
      </template>
    </a-table>
  </AppLayout>
</template>

<script>
import {defineComponent} from "vue";
import {Message} from "@arco-design/web-vue";
import {IconRefresh} from "@arco-design/web-vue/es/icon";
import AppLayout from "@/components/AppLayout.vue";
import {loadRecentLogs} from "@/api/LogRequest";

export default defineComponent({
  name: "logs",
  components: {AppLayout, IconRefresh},
  data() {
    return {
      kw: "",
      moduleFilter: "",
      list: [],
      columns: [
        {title: "时间", dataIndex: "opTime", width: 170},
        {title: "用户", dataIndex: "opUsername", width: 120},
        {title: "模块", dataIndex: "opModule", width: 100},
        {title: "操作", slotName: "opType", width: 100},
        {title: "详情", dataIndex: "opDetail", ellipsis: true, tooltip: true},
        {title: "IP", dataIndex: "opIp", width: 130},
        {title: "耗时", slotName: "opCost", width: 90},
      ],
    };
  },
  computed: {
    modules() {
      const set = new Set();
      this.list.forEach(l => {
        if (l.opModule) set.add(l.opModule);
      });
      return [...set];
    },
    filtered() {
      let arr = this.list;
      if (this.moduleFilter) {
        arr = arr.filter(l => l.opModule === this.moduleFilter);
      }
      if (this.kw) {
        const k = this.kw.toLowerCase();
        arr = arr.filter(l =>
            (l.opUsername || "").toLowerCase().includes(k) ||
            (l.opModule || "").toLowerCase().includes(k) ||
            (l.opType || "").toLowerCase().includes(k) ||
            (l.opDetail || "").toLowerCase().includes(k));
      }
      return arr;
    },
  },
  methods: {
    typeColor(t) {
      const map = {
        "新增": "green", "修改": "orange", "删除": "red",
        "借阅": "arcoblue", "归还": "cyan", "续借": "purple",
        "修改资料": "orange", "修改密码": "red",
      };
      return map[t] || "gray";
    },
    loadAll() {
      loadRecentLogs().then(res => {
        if (res.data.status === true) {
          this.list = (res.data.data || []).map(l => ({
            ...l,
            opTime: l.opTime ? String(l.opTime).replace("T", " ").substring(0, 19) : "",
          }));
        }
      }).catch(() => Message.error("加载失败"));
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
