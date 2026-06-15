import request from "@/api/request";

export function loadShelves() {
    return request.get("/shelf");
}

export function getShelfByNum(num) {
    return request.get("/shelf/" + num);
}

export function addShelf(shelf) {
    return request.post("/shelf", shelf);
}

export function updateShelf(shelf) {
    return request.put("/shelf/" + shelf.bookshelfnum, shelf);
}

export function deleteShelf(num) {
    return request.delete("/shelf/" + num);
}
