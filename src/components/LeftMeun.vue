<template>
  <!-- 折叠态：自渲染图标按钮列表，由 flex 居中保证一条竖直中线对齐 -->
  <div v-if="collapsed" class="collapsed-menu">
    <a-tooltip v-for="item in flatItems" :key="item.key" :content="item.label" position="right" mini>
      <div class="cm-item" :class="{active: selectedKey === item.key}" @click="goto(item.key)">
        <component :is="item.icon"/>
      </div>
    </a-tooltip>
  </div>

  <!-- 展开态：使用标准 a-menu -->
  <a-menu
      v-else
      :defaultOpenKeys="defaultOpenKeys"
      :selectedKeys="[selectedKey]"
      :style="{ width: '100%', background: 'transparent', border: 'none' }"
      theme="dark"
      @menuItemClick="onClickMenuItem"
  >
    <!-- 仪表盘：管理员入口；读者无此入口 -->
    <a-menu-item v-if="isAdmin" key="home">
      <IconDashboard/>
      <span>仪表盘</span>
    </a-menu-item>

    <!-- 读者：商店化借阅入口（首屏） -->
    <a-menu-item v-if="!isAdmin" key="bookstore">
      <icon-book/>
      <span>图书借阅</span>
    </a-menu-item>

    <!-- 公共：公告中心 -->
    <a-menu-item key="notices">
      <icon-notification/>
      <span>公告中心</span>
    </a-menu-item>

    <!-- 借阅 -->
    <a-menu-item key="borrows">
      <icon-calendar/>
      <span>{{ isAdmin ? '借阅管理' : '我的借阅' }}</span>
    </a-menu-item>

    <!-- 读者专属：我的预约、我的收藏 -->
    <a-menu-item v-if="!isAdmin" key="reservations">
      <icon-clock-circle/>
      <span>我的预约</span>
    </a-menu-item>
    <a-menu-item v-if="!isAdmin" key="favorites">
      <icon-heart/>
      <span>我的收藏</span>
    </a-menu-item>

    <!-- 管理员功能组 -->
    <a-sub-menu v-if="isAdmin" key="manage">
      <template #title>
        <span><IconStorage/>资料管理</span>
      </template>
      <a-menu-item key="books">
        <icon-book/>
        <span>图书管理</span>
      </a-menu-item>
      <a-menu-item key="categories">
        <icon-tag/>
        <span>分类管理</span>
      </a-menu-item>
      <a-menu-item key="shelves">
        <icon-storage/>
        <span>书架管理</span>
      </a-menu-item>
      <a-menu-item key="users">
        <icon-user-group/>
        <span>用户管理</span>
      </a-menu-item>
    </a-sub-menu>

    <a-sub-menu v-if="isAdmin" key="audit">
      <template #title>
        <span><IconHistory/>系统审计</span>
      </template>
      <a-menu-item key="logs">
        <icon-history/>
        <span>操作日志</span>
      </a-menu-item>
      <a-menu-item key="reservations">
        <icon-clock-circle/>
        <span>预约管理</span>
      </a-menu-item>
    </a-sub-menu>

    <!-- 个人中心：所有角色可见 -->
    <a-menu-item key="profile">
      <icon-user/>
      <span>个人中心</span>
    </a-menu-item>

    <a-sub-menu key="more">
      <template #title>
        <span><IconMore/>更多</span>
      </template>
      <a-menu-item key="blog">
        <a href="https://blog.1024777.xyz" target="_blank" style="color: inherit; text-decoration: none">个人博客</a>
      </a-menu-item>
      <a-menu-item key="arco">
        <a href="https://arco.design/" target="_blank" style="color: inherit; text-decoration: none">Arco Design</a>
      </a-menu-item>
    </a-sub-menu>
  </a-menu>
</template>

<script>
import {defineComponent} from "vue";
import {
  IconDashboard, IconUserGroup, IconBook, IconStorage,
  IconCalendar, IconMore, IconNotification, IconHistory, IconUser, IconTag,
  IconClockCircle, IconHeart,
} from "@arco-design/web-vue/es/icon";

export default defineComponent({
  components: {
    IconDashboard, IconUserGroup, IconBook, IconStorage,
    IconCalendar, IconMore, IconNotification, IconHistory, IconUser, IconTag,
    IconClockCircle, IconHeart,
  },
  props: {
    collapsed: {type: Boolean, default: false},
  },
  computed: {
    isAdmin() {
      return this.$store.state.role === 'admin';
    },
    selectedKey() {
      return this.$route.name || (this.isAdmin ? 'home' : 'bookstore');
    },
    defaultOpenKeys() {
      const map = {
        books: 'manage', categories: 'manage', shelves: 'manage', users: 'manage',
        logs: 'audit', reservations: this.isAdmin ? 'audit' : null,
        blog: 'more', arco: 'more',
      };
      return [map[this.$route.name]].filter(Boolean);
    },
    /**
     * 折叠态展开成扁平的图标条目列表（按角色过滤）。
     * 聚合菜单组在折叠态下没有意义，这里把它们拆掉，子项只取用户能直达的入口。
     */
    flatItems() {
      const list = [];
      if (this.isAdmin) {
        list.push({key: 'home', label: '仪表盘', icon: 'IconDashboard'});
      } else {
        list.push({key: 'bookstore', label: '图书借阅', icon: 'IconBook'});
      }
      list.push({key: 'notices', label: '公告中心', icon: 'IconNotification'});
      list.push({key: 'borrows', label: this.isAdmin ? '借阅管理' : '我的借阅', icon: 'IconCalendar'});
      if (!this.isAdmin) {
        list.push({key: 'reservations', label: '我的预约', icon: 'IconClockCircle'});
        list.push({key: 'favorites', label: '我的收藏', icon: 'IconHeart'});
      }
      if (this.isAdmin) {
        list.push({key: 'books', label: '图书管理', icon: 'IconBook'});
        list.push({key: 'categories', label: '分类管理', icon: 'IconTag'});
        list.push({key: 'shelves', label: '书架管理', icon: 'IconStorage'});
        list.push({key: 'users', label: '用户管理', icon: 'IconUserGroup'});
        list.push({key: 'reservations', label: '预约管理', icon: 'IconClockCircle'});
        list.push({key: 'logs', label: '操作日志', icon: 'IconHistory'});
      }
      list.push({key: 'messages', label: '消息中心', icon: 'IconNotification'});
      list.push({key: 'profile', label: '个人中心', icon: 'IconUser'});
      return list;
    },
  },
  methods: {
    onClickMenuItem(key) {
      if (key === 'blog' || key === 'arco') return;
      if (this.$route.name !== key) {
        this.$router.push({name: key});
      }
    },
    goto(key) {
      if (this.$route.name !== key) this.$router.push({name: key});
    },
  },
});
</script>

<style scoped>
:deep(.arco-menu-item) {
  color: rgba(250, 249, 247, 0.7) !important;
  border-radius: 8px !important;
  margin: 2px 8px !important;
}

:deep(.arco-menu-item:hover) {
  color: #FAF9F7 !important;
  background: rgba(204, 120, 92, 0.15) !important;
}

:deep(.arco-menu-item.arco-menu-selected) {
  color: #FAF9F7 !important;
  background: rgba(204, 120, 92, 0.25) !important;
}

:deep(.arco-menu-inline-header) {
  color: rgba(250, 249, 247, 0.7) !important;
  border-radius: 8px !important;
  margin: 2px 8px !important;
}

:deep(.arco-menu-inline-header:hover) {
  color: #FAF9F7 !important;
  background: rgba(204, 120, 92, 0.15) !important;
}

/* 折叠态：自渲染图标按钮列表，宽 40 + margin 8 与品牌区完全对齐 */
.collapsed-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 4px;
}

.cm-item {
  width: 40px;
  height: 40px;
  margin: 4px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: rgba(250, 249, 247, 0.7);
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
}

.cm-item:hover {
  color: #FAF9F7;
  background: rgba(204, 120, 92, 0.15);
}

.cm-item.active {
  color: #FAF9F7;
  background: rgba(204, 120, 92, 0.25);
}
</style>
