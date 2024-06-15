import axios from "axios";
import {bUrl} from "@/api/BaseUrl";
////查询全部用户信息
export function Load(){
    let request = axios({
        url:bUrl()+"/user",
        method:"get",
    })
    return request;
}