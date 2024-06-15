import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import Login from "@/views/Login.vue";
import UserManage from "@/views/UserManage.vue";
import Test from "@/views/Test.vue";

const routes = [
  {
    path: '/test',
    name: 'test',
    component: Test
  },
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/users',
    name: 'users',
    component: UserManage
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
