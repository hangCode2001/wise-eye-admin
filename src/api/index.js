import request from "../utils/request";

export const getArticles = (query) => {
  return request.post("/api/admin/getArticles", query);
};

export const getClickLog = (query) => {
  return request.post("/api/admin/getLickLog", query);
};

export const getReptile = (query) => {
  return request.post("/api/admin/getReptile", query);
};
