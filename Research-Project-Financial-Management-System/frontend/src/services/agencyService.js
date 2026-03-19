import api from "./api";

export const getAgencies = async () => {
  const res = await api.get("/agencies");
  return res.data.data;
};

export const getAgencyById = async (id) => {
  const res = await api.get(`/agencies/${id}`);
  return res.data.data;
};

export const createAgency = async (data) => {
  const res = await api.post("/agencies", data);
  return res.data.data;
};

export const updateAgency = async (id, data) => {
  const res = await api.put(`/agencies/${id}`, data);
  return res.data.data;
};