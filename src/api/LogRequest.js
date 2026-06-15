import request from "@/api/request";

/** 最近 500 条操作日志（仅管理员可访问） */
export function loadRecentLogs() {
    return request.get("/log/recent");
}
