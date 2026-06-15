import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import '@arco-design/web-vue/dist/arco.css'

import '@/assets/quanju.css'

document.title = '智能图书资源管理服务平台';

/**
 * 屏蔽浏览器原生的 "ResizeObserver loop completed with undelivered notifications" 报错。
 * 这是 ResizeObserver 一帧内多次触发时浏览器主动抛出的良性提醒，不影响渲染。
 * Arco Design 的 Table / Layout / Menu 等组件大量使用 ResizeObserver，在折叠菜单 /
 * 切换路由时常会触发，导致 webpack-dev-server 的 overlay 弹红屏。
 * 通过捕获并阻止冒泡，避免 dev overlay 误报。
 */
const RESIZE_OBSERVER_ERR = 'ResizeObserver loop';
window.addEventListener('error', (e) => {
    if (e.message && e.message.includes(RESIZE_OBSERVER_ERR)) {
        e.stopImmediatePropagation();
        e.preventDefault();
    }
}, true);
window.addEventListener('unhandledrejection', (e) => {
    if (e.reason && String(e.reason.message || e.reason).includes(RESIZE_OBSERVER_ERR)) {
        e.stopImmediatePropagation();
        e.preventDefault();
    }
});

createApp(App)
    .use(store)
    .use(router)
    .use(ArcoVue)
    .use(ArcoVueIcon)
    .mount('#app')
