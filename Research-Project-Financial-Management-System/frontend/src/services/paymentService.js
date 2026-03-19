import api from "./api";

export const getPayments = async (filters = {}) => {
  const res = await api.get("/payments", { params: filters });
  return res.data.data;
};

export const getPaymentSummary = async () => {
  const res = await api.get("/payments/summary");
  return res.data.data;
};

export const createPayment = async (data) => {
  const res = await api.post("/payments", data);
  return res.data.data;
};

export const updatePayment = async (id, data) => {
  const res = await api.put(`/payments/${id}`, data);
  return res.data.data;
};