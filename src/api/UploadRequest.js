import {bUrl} from "@/api/BaseUrl";

/**
 * 上传图书封面到本地存储,后端返回 /uploads/xxx.jpg。
 * 用 fetch 是因为 axios 默认会序列化 FormData,容易丢 boundary。
 */
export async function uploadCover(file) {
    return doUpload(file, "/upload/cover");
}

/** 上传头像 */
export async function uploadAvatar(file) {
    return doUpload(file, "/upload/avatar");
}

async function doUpload(file, path) {
    const fd = new FormData();
    fd.append("file", file);
    const token = sessionStorage.getItem("token") || "";
    const resp = await fetch(bUrl() + path, {
        method: "POST",
        headers: token ? {Authorization: "Bearer " + token} : {},
        body: fd,
    });
    if (!resp.ok) {
        throw new Error("HTTP " + resp.status);
    }
    const json = await resp.json();
    if (!json.status) {
        throw new Error(json.msg || "上传失败");
    }
    const rel = json.data && json.data.url;
    if (rel && rel.startsWith("/")) {
        return bUrl() + rel;
    }
    return rel;
}
