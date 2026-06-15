import request from "@/api/request";

/** 全部图书 */
export function loadBooks() {
    return request.get("/book");
}

/** 按 ISBN 查询 */
export function getBookByIsbn(bisbn) {
    return request.get("/book/" + bisbn);
}

/** 新增图书 */
export function addBook(book) {
    return request.post("/book", book);
}

/** 更新图书 */
export function updateBook(book) {
    return request.put("/book/" + book.bisbn, book);
}

/** 删除图书 */
export function deleteBook(bisbn) {
    return request.delete("/book/" + bisbn);
}

/** 按关键词搜索图书 */
export function searchBooks(keyword) {
    return request.get("/book/search", { params: { keyword } });
}
