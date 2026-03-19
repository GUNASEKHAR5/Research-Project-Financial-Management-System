import api from "./api";

export const getAuditLogs = async (filters = {}) => {
  const res = await api.get("/audit", { params: filters });
  return res.data;
};

export const getAuditStats = async () => {
  const res = await api.get("/audit/stats");
  return res.data.data;
};