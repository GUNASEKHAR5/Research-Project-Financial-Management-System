import api from "./api";

export const getProjects = async (status) => {
  const params = status ? { status } : {};
  const res = await api.get("/projects", { params });
  return res.data.data;
};

export const getProjectById = async (id) => {
  const res = await api.get(`/projects/${id}`);
  return res.data.data;
};

export const createProject = async (data) => {
  const res = await api.post("/projects", data);
  return res.data.data;
};

export const updateProject = async (id, data) => {
  const res = await api.put(`/projects/${id}`, data);
  return res.data.data;
};

export const archiveProject = async (id) => {
  const res = await api.patch(`/projects/${id}/archive`);
  return res.data.data;
};