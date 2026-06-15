import request from "@/api/request";

/** 我的预约 */
export function loadMyReservations() {
    return request.get("/reservation/mine");
}

/** 全部预约（仅管理员） */
export function loadAllReservations() {
    return request.get("/reservation");
}

/** 创建预约：仅自己，body 只需 bisbn */
export function createReservation(bisbn) {
    return request.post("/reservation", {bisbn});
}

/** 取消预约 */
export function cancelReservation(rid) {
    return request.put("/reservation/" + rid + "/cancel");
}

/** 删除预约（仅管理员） */
export function deleteReservation(rid) {
    return request.delete("/reservation/" + rid);
}

/** 查询某本书的预约队列人数 */
export function getReservationQueue(bisbn) {
    return request.get("/reservation/queue/" + bisbn);
}
