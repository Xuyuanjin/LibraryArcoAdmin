import axios from "axios";
import {bUrl} from "@/api/BaseUrl";
import {Message} from "@arco-design/web-vue";
import router from "@/router";

/**
 * 全局 axios 实例：自动拼基础 URL、附带登录 token、统一 401 处理。
 * 所有请求统一从这里走，避免每个组件再单独 import axios。
 */
const request = axios.create({
    timeout: 10000,
});

//请求拦截：拼基础 URL，附带 Authorization 头
request.interceptors.request.use(config => {
    if (config.url && !/^https?:\/\//i.test(config.url)) {
        config.url = bUrl() + config.url;
    }
    const token = sessionStorage.getItem("token");
    if (token) {
        config.headers.Authorization = "Bearer " + token;
    }
    return config;
}, error => Promise.reject(error));

//响应拦截：401 自动登出并跳登录页
request.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            Message.warning("登录已过期，请重新登录");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("logined");
            sessionStorage.removeItem("role");
            router.replace("/");
        }
        return Promise.reject(error);
    }
);

export default request;
