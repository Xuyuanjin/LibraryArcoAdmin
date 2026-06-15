import {createStore} from 'vuex'

/**
 * 仅保存当前登录用户的展示信息。
 * Token 与角色直接读 sessionStorage，避免刷新丢失。
 */
export default createStore({
    state: {
        userName: sessionStorage.getItem("userName") || "",
        realName: sessionStorage.getItem("realName") || "",
        role: sessionStorage.getItem("role") || "",
        uid: sessionStorage.getItem("uid") || "",
        avatar: sessionStorage.getItem("avatar") || "",
    },
    mutations: {
        setUser(state, payload) {
            state.userName = payload.userName || "";
            state.realName = payload.realName || "";
            state.role = payload.role || "";
            state.uid = payload.uid || "";
            state.avatar = payload.avatar || "";
        },
        clearUser(state) {
            state.userName = "";
            state.realName = "";
            state.role = "";
            state.uid = "";
            state.avatar = "";
        },
    },
    actions: {
        loginSuccess({commit}, payload) {
            if (payload.token) sessionStorage.setItem("token", payload.token);
            sessionStorage.setItem("logined", "true");
            sessionStorage.setItem("userName", payload.userName || "");
            sessionStorage.setItem("realName", payload.realName || "");
            sessionStorage.setItem("role", payload.role || "");
            sessionStorage.setItem("uid", payload.uid || "");
            sessionStorage.setItem("avatar", payload.avatar || "");
            commit("setUser", payload);
        },
        logout({commit}) {
            sessionStorage.clear();
            commit("clearUser");
        },
    },
})
