import request from "@/utils/request";

// 查看banner列表
export function listBanner(query) {
  return request({
    url: "/market/banner/list",
    method: "get",
    params: query,
  });
}

// 查询公告详细
export function getBanner(noticeId) {
  return request({
    url: "/market/banner/" + noticeId,
    method: "get",
  });
}

// 新增公告
export function addBanner(data) {
  return request({
    url: "/market/banner",
    method: "post",
    data: data,
  });
}

// 修改公告
export function updateBanner(data) {
  return request({
    url: "/market/banner",
    method: "put",
    data: data,
  });
}

// 删除公告
export function delBanner(noticeId) {
  return request({
    url: "/market/banner/" + noticeId,
    method: "delete",
  });
}
