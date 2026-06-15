import request from "@/api/request";

/** 我的消息 */
export function loadMyMessages() {
    return request.get("/message/mine");
}

/** 未读数 {count} */
export function loadUnreadCount() {
    return request.get("/message/unread");
}

export function markRead(mid) {
    return request.put("/message/" + mid + "/read");
}

export function markAllRead() {
    return request.put("/message/readAll");
}

export function deleteMessage(mid) {
    return request.delete("/message/" + mid);
}
