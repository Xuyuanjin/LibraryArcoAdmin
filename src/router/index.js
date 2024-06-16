import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import Login from "@/views/Login.vue";
import UserManage from "@/views/UserManage.vue";
import Test from "@/views/Test.vue";
import bookManage from "@/views/BookManage.vue";

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
  {
    path: '/books',
    name: 'books',
    component: bookManage
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
