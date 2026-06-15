import request from "@/api/request";
import {bUrl} from "@/api/BaseUrl";

/**
 * 数据导出（CSV）。
 * 这里返回 blob，调用方再触发浏览器下载。
 * 注意带上 token，否则后端会 401。
 */
export function exportBooks() {
    return request.get("/export/books", {responseType: "blob"});
}

export function exportBorrows() {
    return request.get("/export/borrows", {responseType: "blob"});
}

/** 把 blob 触发下载 */
export function triggerDownload(blob, filename) {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/** 兜底：拼绝对 URL（不走 axios，无法附带 token，谨慎使用） */
export function buildExportUrl(name) {
    return bUrl() + "/export/" + name;
}
