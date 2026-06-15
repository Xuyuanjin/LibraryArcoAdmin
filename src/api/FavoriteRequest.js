import request from "@/api/request";

/** 我的收藏 */
export function loadMyFavorites() {
    return request.get("/favorite/mine");
}

/** 是否已收藏某书 */
export function checkFavorited(bisbn) {
    return request.get("/favorite/check/" + bisbn);
}

export function addFavorite(bisbn) {
    return request.post("/favorite/" + bisbn);
}

export function removeFavorite(bisbn) {
    return request.delete("/favorite/" + bisbn);
}
