<template>
  <a-menu
      :defaultOpenKeys="['1']"
      :defaultSelectedKeys="['0_3']"
      :style="{ width: '100%' }"
      @menuItemClick="onClickMenuItem"
  >

    <a-menu-item key="0_1" @click="tousers">
      <IconHome/>
      首页
    </a-menu-item>

    <a-sub-menu>
      <template #title>
        <span><IconCalendar/>系统管理</span>
      </template>
      <a-menu-item key="4_1" @click="toUserM">
        <IconCalendar/>
        用户管理
      </a-menu-item>
      <a-menu-item key="4_2" @click="toBookM">
        <IconCalendar/>
        图书管理
      </a-menu-item>
      <a-menu-item key="4_3" @click="toEM">
        <IconCalendar/>
        部门管理
      </a-menu-item>
    </a-sub-menu>
  </a-menu>

</template>

<script>
import {IconCaretRight, IconCaretLeft, IconHome, IconCalendar} from '@arco-design/web-vue/es/icon';
import {defineComponent} from "vue";
export default defineComponent({
  components: {
    IconCaretRight,
    IconCaretLeft,
    IconHome,
    IconCalendar,
  },
  // 数据
  data() {
    return{
      collapsed: false
    }

  },
  methods: {
    // 处理菜单点击
    onClickMenuItem(key, keyPath) {
      console.log(key, keyPath);
    },
    //跳转用户管理
    toUserM(){
      this.$router.push("/users")
    },
    //跳转图书管理
    toBookM(){
      this.$router.push("/books")
    }
  },

});
</script>

<style scoped>

</style>