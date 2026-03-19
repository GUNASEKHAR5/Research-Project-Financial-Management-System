import api from "./api";

export const getDashboardStats = async () => {
  const res = await api.get("/reports/dashboard");
  return res.data.data;
};

export const getProjectSummary = async () => {
  const res = await api.get("/reports/project-summary");
  return res.data.data;
};

export const getMonthlyExpenseReport = async (months = 6) => {
  const res = await api.get("/reports/monthly-expense", { params: { months } });
  return res.data.data;
};

export const getBudgetUtilization = async () => {
  const res = await api.get("/reports/budget-utilization");
  return res.data.data;
};

export const getAgencyFundingReport = async () => {
  const res = await api.get("/reports/agency-funding");
  return res.data.data;
};