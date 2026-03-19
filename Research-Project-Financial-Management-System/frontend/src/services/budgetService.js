import api from "./api";

export const getBudgetsByProject = async (projectId) => {
  const res = await api.get(`/budgets/project/${projectId}`);
  return res.data.data;
};

export const getBudgetSummary = async (projectId) => {
  const res = await api.get(`/budgets/project/${projectId}/summary`);
  return res.data.data;
};

export const updateBudgetAllocations = async (projectId, allocations) => {
  const res = await api.put(`/budgets/project/${projectId}`, { allocations });
  return res.data.data;
};