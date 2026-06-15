import {createRouter, createWebHistory} from 'vue-router'
import Login from "@/views/Login.vue";
import UserManage from "@/views/UserManage.vue";
import bookManage from "@/views/BookManage.vue";
import Register from "@/views/Register.vue";
import Home from "@/views/Home.vue";
import BorrowManage from "@/views/BorrowManage.vue";
import ShelfManage from "@/views/ShelfManage.vue";
import BookStore from "@/views/BookStore.vue";
import CategoryManage from "@/views/CategoryManage.vue";
import NoticeManage from "@/views/NoticeManage.vue";
import OperationLog from "@/views/OperationLog.vue";
import Profile from "@/views/Profile.vue";
import Reservation from "@/views/Reservation.vue";
import Favorite from "@/views/Favorite.vue";
import MessageCenter from "@/views/MessageCenter.vue";

const routes = [
    {path: '/', name: 'login', component: Login, meta: {public: true}},
    {path: '/register', name: 'register', component: Register, meta: {public: true}},
    {path: '/home', name: 'home', component: Home},
    {path: '/bookstore', name: 'bookstore', component: BookStore},
    {path: '/profile', name: 'profile', component: Profile},
    {path: '/notices', name: 'notices', component: NoticeManage},
    {path: '/messages', name: 'messages', component: MessageCenter},
    {path: '/reservations', name: 'reservations', component: Reservation},
    {path: '/favorites', name: 'favorites', component: Favorite},
    {path: '/users', name: 'users', component: UserManage, meta: {role: 'admin'}},
    {path: '/books', name: 'books', component: bookManage, meta: {role: 'admin'}},
    {path: '/borrows', name: 'borrows', component: BorrowManage},
    {path: '/shelves', name: 'shelves', component: ShelfManage, meta: {role: 'admin'}},
    {path: '/categories', name: 'categories', component: CategoryManage, meta: {role: 'admin'}},
    {path: '/logs', name: 'logs', component: OperationLog, meta: {role: 'admin'}},
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const logined = sessionStorage.getItem("logined") === "true";
    const role = sessionStorage.getItem("role");

    if (to.meta && to.meta.public) {
        return next();
    }
    if (!logined) {
        return next({name: "login"});
    }
    if (to.meta && to.meta.role && to.meta.role !== role) {
        return next({name: role === "admin" ? "home" : "bookstore"});
    }
    next();
})

router.afterEach(() => {
    document.title = "智能图书资源管理服务平台";
})

export default router
