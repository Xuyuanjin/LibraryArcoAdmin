import request from "@/api/request";

/** 全部用户 */
export function loadUsers() {
    return request.get("/user");
}

/** 按 uid 查询 */
export function getUserById(uid) {
    return request.get("/user/" + uid);
}

/** 新增用户 */
export function addUser(user) {
    return request.post("/user", user);
}

/** 更新用户 */
export function updateUser(user) {
    return request.put("/user/" + user.uid, user);
}

/** 删除用户 */
export function deleteUser(uid) {
    return request.delete("/user/" + uid);
}

/** 登录（不带 token） */
export function login(form) {
    return request.post("/login", form);
}

/** 注册 */
export function register(form) {
    return request.post("/register", form);
}

/** 演示账号样例(每个角色一个,不下发密码) */
export function loadDemoAccounts() {
    return request.get("/demoAccounts");
}

/** 个人中心：获取当前登录用户的资料 */
export function getProfile() {
    return request.get("/user/profile");
}

/** 个人中心：修改资料 */
export function updateProfile(form) {
    return request.put("/user/profile", form);
}

/** 个人中心：修改密码 */
export function changePassword(oldPassword, newPassword) {
    return request.put("/user/changePassword", {oldPassword, newPassword});
}
