import api from "./api";

export const getExpenses = async (filters = {}) => {
  const res = await api.get("/expenses", { params: filters });
  return res.data.data;
};

export const getExpenseById = async (id) => {
  const res = await api.get(`/expenses/${id}`);
  return res.data.data;
};

export const createExpense = async (data) => {
  const res = await api.post("/expenses", data);
  return res.data.data;
};

export const approveExpense = async (id, remarks = "") => {
  const res = await api.post(`/expenses/${id}/approve`, { remarks });
  return res.data;
};

export const rejectExpense = async (id, remarks = "") => {
  const res = await api.post(`/expenses/${id}/reject`, { remarks });
  return res.data;
};