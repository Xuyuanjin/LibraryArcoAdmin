import request from "@/api/request";

/** 全部借阅记录 */
export function loadBorrows() {
    return request.get("/jieyue");
}

/** 我的借阅 */
export function loadMyBorrows(uid) {
    return request.get("/jieyue/user/" + uid);
}

/** 借书 */
export function borrowBook(uid, bisbn) {
    return request.post("/jieyue/borrow", {uid, bisbn});
}

/** 还书 */
export function returnBook(jid) {
    return request.put("/jieyue/return/" + jid);
}

/** 续借 */
export function renewBorrow(jid) {
    return request.put("/jieyue/renew/" + jid);
}

/** 删除借阅记录 */
export function deleteBorrow(jid) {
    return request.delete("/jieyue/" + jid);
}
