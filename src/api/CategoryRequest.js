import request from "@/api/request";

/** 全部分类（带各分类下图书数量） */
export function loadCategories() {
    return request.get("/category");
}

export function getCategory(cid) {
    return request.get("/category/" + cid);
}

export function addCategory(category) {
    return request.post("/category", category);
}

export function updateCategory(category) {
    return request.put("/category/" + category.cid, category);
}

export function deleteCategory(cid) {
    return request.delete("/category/" + cid);
}
