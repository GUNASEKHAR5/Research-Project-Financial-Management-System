import api from "./api";

export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data.data;
};

export const createUser = async (data) => {
  const res = await api.post("/users", data);
  return res.data.data;
};

export const updateUser = async (id, data) => {
  const res = await api.put(`/users/${id}`, data);
  return res.data.data;
};

// Soft-delete: sets is_active = false
export const deleteUser = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};

// Re-activate: sets is_active = true via PUT
export const activateUser = async (id) => {
  const res = await api.put(`/users/${id}`, { is_active: true });
  return res.data.data;
};