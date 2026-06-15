import request from "@/api/request";

/** 后台公告列表（管理员可见所有，读者只看到已发布） */
export function loadNotices() {
    return request.get("/notice");
}

/** 已发布的公告 */
export function loadPublishedNotices() {
    return request.get("/notice/published");
}

/** 首页 Top N 条公告 */
export function loadTopNotices(limit = 5) {
    return request.get("/notice/top", {params: {limit}});
}

export function getNotice(nid) {
    return request.get("/notice/" + nid);
}

export function addNotice(notice) {
    return request.post("/notice", notice);
}

export function updateNotice(notice) {
    return request.put("/notice/" + notice.nid, notice);
}

export function deleteNotice(nid) {
    return request.delete("/notice/" + nid);
}
