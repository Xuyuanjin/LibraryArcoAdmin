<template>
  <div class="app-layout-wrap">
    <a-layout class="app-layout">
      <a-layout-sider hide-trigger collapsible :collapsed="collapsed" :collapsed-width="56" :style="{background: '#1A1A1A'}">
        <div class="brand" :class="{collapsed}">
          <icon-book :size="22" class="brand-icon"/>
          <span class="brand-text" v-if="!collapsed">智能图书资源管理服务平台</span>
        </div>
        <LeftMeun :collapsed="collapsed"/>
      </a-layout-sider>
      <a-layout :style="{background: '#FAF9F7'}">
        <a-layout-header class="app-header">
          <a-button shape="round" @click="collapsed = !collapsed" class="collapse-btn">
            <IconCaretRight v-if="collapsed"/>
            <IconCaretLeft v-else/>
          </a-button>
          <AvatarTop/>
        </a-layout-header>
        <a-layout class="app-body">
          <a-breadcrumb :style="{ margin: '16px 0' }">
            <a-breadcrumb-item v-for="(crumb, idx) in breadcrumbs" :key="idx">{{ crumb }}</a-breadcrumb-item>
          </a-breadcrumb>
          <div class="content-area">
            <slot/>
          </div>
          <a-layout-footer class="app-footer">Copyright © 2026 智能图书资源管理与服务平台 · 至上松一</a-layout-footer>
        </a-layout>
      </a-layout>
    </a-layout>
  </div>
</template>

<script>
import {defineComponent} from "vue";
import {IconCaretRight, IconCaretLeft, IconBook} from "@arco-design/web-vue/es/icon";
import AvatarTop from "@/components/AvatarTop.vue";
import LeftMeun from "@/components/LeftMeun.vue";

export default defineComponent({
  name: "AppLayout",
  components: {AvatarTop, LeftMeun, IconCaretRight, IconCaretLeft, IconBook},
  props: {
    breadcrumbs: {
      type: Array,
      default: () => ["首页"],
    },
  },
  data() {
    return {collapsed: false};
  },
});
</script>

<style scoped>
.app-layout-wrap {
  height: 100vh;
}

.app-layout {
  height: 100vh;
  background: #FAF9F7;
  overflow: hidden;
}

.app-layout :deep(.arco-layout-sider) {
  border-right: 1px solid rgba(255, 255, 255, 0.04);
}

.logo {
  height: 40px;
  margin: 12px 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

/* 顶部品牌区：图标 + 名称，折叠时只剩图标 */
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  margin: 8px 8px 8px;
  padding: 0 8px;
  background: linear-gradient(135deg, rgba(204, 120, 92, 0.18), rgba(212, 165, 116, 0.08));
  border: 1px solid rgba(204, 120, 92, 0.25);
  border-radius: 8px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.brand.collapsed {
  min-height: 40px;
  padding: 0;
  justify-content: center;
}

.brand-icon {
  color: #CC785C;
  flex-shrink: 0;
}

.brand-text {
  flex: 1;
  min-width: 0;
  color: #FAF9F7;
  font-weight: 600;
  font-size: 11px;
  line-height: 40px;
  letter-spacing: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
}

.app-header {
  height: 64px;
  line-height: 64px;
  background: #FFFFFF;
  border-bottom: 1px solid #E8E4DF;
  padding-left: 20px;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 10;
  flex-shrink: 0;
}

.collapse-btn {
  border: none;
  background: transparent;
}

.app-body {
  background: #FAF9F7;
  padding: 0 24px;
  overflow-y: auto;
  flex: 1;
}

.app-footer {
  height: 48px;
  font-size: 13px;
  line-height: 48px;
  text-align: center;
  color: #9B9590;
  flex-shrink: 0;
}

.content-area {
  flex: 1;
}
</style>
