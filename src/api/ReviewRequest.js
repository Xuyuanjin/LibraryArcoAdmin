import request from "@/api/request";

/** 某书的全部评论 */
export function loadReviews(bisbn) {
    return request.get("/review/book/" + bisbn);
}

/** 某书的评分汇总 {avg, cnt} */
export function loadReviewStats(bisbn) {
    return request.get("/review/stats/" + bisbn);
}

/** 我对某书的评论（用于回填） */
export function loadMyReview(bisbn) {
    return request.get("/review/mine/" + bisbn);
}

/** 提交或更新评论 */
export function submitReview(bisbn, rating, content) {
    return request.post("/review", {bisbn, rating, content});
}

/** 删除评论（仅管理员） */
export function deleteReview(rvid) {
    return request.delete("/review/" + rvid);
}
