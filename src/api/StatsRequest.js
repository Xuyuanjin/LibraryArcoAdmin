import request from "@/api/request";

/** 首页统计概览 */
export function loadOverview() {
    return request.get("/stats/overview");
}

/** 增强版仪表盘数据 */
export function loadDashboard() {
    return request.get("/stats/dashboard");
}

/** 立即触发逾期扫描(管理员) */
export function scanOverdue() {
    return request.post("/stats/scanOverdue");
}
