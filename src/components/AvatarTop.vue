<template>
  <div class="avatar-top">
    <!-- 消息铃铛：未读数 badge，点击进消息中心 -->
    <a-badge :count="unreadCount" :max-count="99" :offset="[-4, 4]">
      <a-button shape="circle" class="bell-btn" @click="$router.push({name: 'messages'})">
        <icon-notification/>
      </a-button>
    </a-badge>

    <div class="user-info">
      <span class="user-name">欢迎，{{ userName }}</span>
      <a-tag :color="role === 'admin' ? 'orangered' : 'green'" size="small">
        {{ role === 'admin' ? '管理员' : '读者' }}
      </a-tag>
    </div>
    <a-dropdown trigger="hover">
      <a-avatar :size="40" class="user-avatar">
        <img v-if="avatar" :src="avatar" alt="avatar"/>
        <icon-user v-else/>
      </a-avatar>
      <template #content>
        <a-doption @click="$router.push({name: 'profile'})">
          <icon-user style="margin-right: 6px"/>
          个人中心
        </a-doption>
        <a-doption @click="$router.push({name: 'messages'})">
          <icon-notification style="margin-right: 6px"/>
          消息中心 <a-tag v-if="unreadCount" color="red" size="small" style="margin-left: 4px">{{ unreadCount }}</a-tag>
        </a-doption>
        <a-doption @click="logout">
          <icon-export style="margin-right: 6px"/>
          退出登录
        </a-doption>
      </template>
    </a-dropdown>
  </div>
</template>

<script>
import {defineComponent} from "vue";
import {IconUser, IconExport, IconNotification} from "@arco-design/web-vue/es/icon";
import {loadUnreadCount} from "@/api/MessageRequest";

export default defineComponent({
  components: {IconUser, IconExport, IconNotification},
  data() {
    return {
      unreadCount: 0,
      timer: null,
    };
  },
  computed: {
    userName() { return this.$store.state.userName; },
    role() { return this.$store.state.role; },
    avatar() { return this.$store.state.avatar; },
  },
  methods: {
    refresh() {
      loadUnreadCount().then(res => {
        if (res.data.status === true) this.unreadCount = res.data.data.count || 0;
      }).catch(() => {});
    },
    logout() {
      if (this.timer) clearInterval(this.timer);
      this.$store.dispatch('logout');
      this.$router.replace("/");
    },
  },
  mounted() {
    this.refresh();
    //每 60 秒轮询一次未读数
    this.timer = setInterval(this.refresh, 60000);
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer);
  },
});
</script>

<style scoped>
.avatar-top {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 16px;
  padding-right: 24px;
}

.bell-btn {
  border: 1px solid #E8E4DF;
  background: #FAF9F7;
  color: #6B6560;
}

.bell-btn:hover {
  background: #F5F0EB;
  color: #CC785C;
  border-color: #D4A574;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 14px;
  color: #1A1A1A;
  font-weight: 500;
}

.user-avatar {
  background: #CC785C;
  cursor: pointer;
  transition: all 0.2s;
}

.user-avatar:hover {
  background: #B56A50;
  transform: scale(1.05);
}
</style>
