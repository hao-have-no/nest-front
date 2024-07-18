import request from '@/utils/request'
export function listBanner(query){
    return request({
        url:'/market/banner/list',
        method:'get',
        params:query
    })
}