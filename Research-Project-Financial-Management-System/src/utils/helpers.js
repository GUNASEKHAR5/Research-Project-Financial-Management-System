/**
 * Format a number as Indian Rupee shorthand
 * e.g. 5000000 → ₹5.00M, 450000 → ₹450K
 */
export const formatCurrency = (n) => {
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(2) + "Cr";
  if (n >= 100000) return "₹" + (n / 100000).toFixed(2) + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(0) + "K";
  return "₹" + n;
};

/**
 * Calculate percentage of spent vs budget (capped at 100)
 */
export const calcPercent = (spent, budget) =>
  budget === 0 ? 0 : Math.min(100, Math.round((spent / budget) * 100));

/**
 * Return a Tailwind color class string based on utilization %
 */
export const budgetColor = (percent) => {
  if (percent >= 90) return "#f43f5e";
  if (percent >= 70) return "#f59e0b";
  return "#6366f1";
};

/**
 * Get initials from a full name (up to 2 chars)
 */
export const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * Return category budget split weights for a project
 */
export const getCategoryBreakdown = (budget, spent) => [
  { name: "Equipment",     allocated: budget * 0.35, spent: spent * 0.42 },
  { name: "Salary",        allocated: budget * 0.30, spent: spent * 0.28 },
  { name: "Travel",        allocated: budget * 0.10, spent: spent * 0.08 },
  { name: "Consumables",   allocated: budget * 0.15, spent: spent * 0.16 },
  { name: "Miscellaneous", allocated: budget * 0.10, spent: spent * 0.06 },
];

/**
 * Shorten a project title to first N words
 */
export const shortTitle = (title, words = 2) =>
  title.split(" ").slice(0, words).join(" ");

/**
 * Get status dot color for audit log entries
 */
export const auditDotColor = (type) => {
  const map = {
    approve: "bg-emerald-400",
    reject: "bg-rose-400",
    create: "bg-indigo-400",
    submit: "bg-cyan-400",
    verify: "bg-amber-400",
  };
  return map[type] || "bg-zinc-500";
};