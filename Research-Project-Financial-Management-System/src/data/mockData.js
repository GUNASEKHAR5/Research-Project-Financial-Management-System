export const USERS = [
  { id: 1, name: "Dr. Arjun Mehta", role: "admin", email: "arjun@university.edu", joined: "2023-01-10" },
  { id: 2, name: "Prof. Priya Nair", role: "faculty", email: "priya@university.edu", joined: "2023-03-15" },
  { id: 3, name: "Ravi Kumar", role: "finance", email: "ravi@university.edu", joined: "2023-06-01" },
  { id: 4, name: "Dr. Sneha Iyer", role: "faculty", email: "sneha@university.edu", joined: "2024-01-20" },
];

export const AGENCIES = [
  { id: 1, name: "DST", fullName: "Dept. of Science & Technology", contact: "dst@gov.in", projects: 3, totalFunded: 11200000 },
  { id: 2, name: "DRDO", fullName: "Defence R&D Organisation", contact: "drdo@gov.in", projects: 2, totalFunded: 12100000 },
  { id: 3, name: "ISRO", fullName: "Indian Space Research Org.", contact: "isro@gov.in", projects: 1, totalFunded: 3500000 },
];

export const PROJECTS = [
  { id: 101, title: "AI in Healthcare Diagnostics", agency: "DST", pi: "Dr. Arjun Mehta", budget: 5000000, spent: 3200000, status: "Active", start: "2024-01-01", end: "2026-12-31" },
  { id: 102, title: "Quantum Computing Materials", agency: "DRDO", pi: "Prof. Priya Nair", budget: 8000000, spent: 2100000, status: "Active", start: "2024-06-01", end: "2027-05-31" },
  { id: 103, title: "Satellite Signal Processing", agency: "ISRO", pi: "Dr. Arjun Mehta", budget: 3500000, spent: 3400000, status: "Active", start: "2023-04-01", end: "2025-03-31" },
  { id: 104, title: "Green Hydrogen Research", agency: "DST", pi: "Prof. Priya Nair", budget: 6200000, spent: 800000, status: "Active", start: "2025-01-01", end: "2027-12-31" },
  { id: 105, title: "Nano Drug Delivery Systems", agency: "DRDO", pi: "Dr. Arjun Mehta", budget: 4100000, spent: 4050000, status: "Archived", start: "2022-07-01", end: "2024-06-30" },
];

export const EXPENSES = [
  { id: 501, project: "AI in Healthcare Diagnostics", projectId: 101, category: "Equipment", amount: 450000, date: "2026-03-01", status: "Approved", submittedBy: "Prof. Priya Nair", receipt: true, description: "High-resolution MRI scanner module" },
  { id: 502, project: "Quantum Computing Materials", projectId: 102, category: "Salary", amount: 85000, date: "2026-03-05", status: "Pending", submittedBy: "Prof. Priya Nair", receipt: true, description: "Research assistant salary – March" },
  { id: 503, project: "Satellite Signal Processing", projectId: 103, category: "Travel", amount: 32000, date: "2026-03-08", status: "Pending", submittedBy: "Dr. Arjun Mehta", receipt: false, description: "Conference travel – ISRO symposium" },
  { id: 504, project: "Green Hydrogen Research", projectId: 104, category: "Consumables", amount: 120000, date: "2026-03-09", status: "Approved", submittedBy: "Prof. Priya Nair", receipt: true, description: "Chemical reagents and lab supplies" },
  { id: 505, project: "AI in Healthcare Diagnostics", projectId: 101, category: "Miscellaneous", amount: 15000, date: "2026-03-10", status: "Rejected", submittedBy: "Dr. Arjun Mehta", receipt: false, description: "Office stationery and printing" },
  { id: 506, project: "Quantum Computing Materials", projectId: 102, category: "Equipment", amount: 320000, date: "2026-02-20", status: "Approved", submittedBy: "Dr. Sneha Iyer", receipt: true, description: "Cryogenic cooling unit" },
];

export const PAYMENTS = [
  { id: 1, project: "AI in Healthcare Diagnostics", projectId: 101, agency: "DST", amount: 2500000, type: "Research Grant", date: "2024-01-15", status: "Received" },
  { id: 2, project: "Quantum Computing Materials", projectId: 102, agency: "DRDO", amount: 4000000, type: "Installment 1", date: "2024-07-01", status: "Received" },
  { id: 3, project: "Green Hydrogen Research", projectId: 104, agency: "DST", amount: 3000000, type: "Research Grant", date: "2025-01-20", status: "Received" },
  { id: 4, project: "Satellite Signal Processing", projectId: 103, agency: "ISRO", amount: 1750000, type: "Installment 2", date: "2025-09-01", status: "Pending" },
  { id: 5, project: "Nano Drug Delivery Systems", projectId: 105, agency: "DRDO", amount: 4100000, type: "Research Grant", date: "2022-08-01", status: "Received" },
];

export const AUDIT_LOGS = [
  { id: 1, user: "Admin", action: "Approved Expense #501", project: "AI Healthcare", time: "10 Mar 2026, 09:14", type: "approve" },
  { id: 2, user: "Prof. Priya Nair", action: "Submitted Expense #502", project: "Quantum Computing", time: "09 Mar 2026, 17:42", type: "submit" },
  { id: 3, user: "Admin", action: "Created Project #104", project: "Green Hydrogen", time: "08 Mar 2026, 11:30", type: "create" },
  { id: 4, user: "Ravi Kumar", action: "Verified Payment #3", project: "Green Hydrogen", time: "07 Mar 2026, 14:05", type: "verify" },
  { id: 5, user: "Admin", action: "Rejected Expense #505", project: "AI Healthcare", time: "06 Mar 2026, 10:20", type: "reject" },
  { id: 6, user: "Dr. Sneha Iyer", action: "Submitted Expense #506", project: "Quantum Computing", time: "05 Mar 2026, 15:00", type: "submit" },
  { id: 7, user: "Admin", action: "Approved Expense #506", project: "Quantum Computing", time: "05 Mar 2026, 17:55", type: "approve" },
];

export const MONTHLY_SPEND = [
  { month: "Oct", amount: 420000 },
  { month: "Nov", amount: 680000 },
  { month: "Dec", amount: 510000 },
  { month: "Jan", amount: 890000 },
  { month: "Feb", amount: 720000 },
  { month: "Mar", amount: 540000 },
];

export const CATEGORY_DATA = [
  { name: "Equipment", value: 3800000, color: "#6366f1" },
  { name: "Salary", value: 2100000, color: "#22d3ee" },
  { name: "Travel", value: 850000, color: "#f59e0b" },
  { name: "Consumables", value: 1200000, color: "#10b981" },
  { name: "Misc", value: 600000, color: "#f43f5e" },
];

export const BUDGET_CATEGORIES = ["Equipment", "Salary", "Travel", "Consumables", "Miscellaneous"];

export const EXPENSE_CATEGORIES = ["Equipment", "Salary", "Travel", "Consumables", "Miscellaneous"];

export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "📊", roles: ["admin", "faculty", "finance"] },
  { key: "projects", label: "Projects", icon: "🔬", roles: ["admin", "faculty", "finance"] },
  { key: "budget", label: "Budget", icon: "💰", roles: ["admin", "finance"] },
  { key: "expenses", label: "Expenses", icon: "🧾", roles: ["admin", "faculty", "finance"] },
  { key: "payments", label: "Payments", icon: "💳", roles: ["admin", "finance"] },
  { key: "agencies", label: "Agencies", icon: "🏛️", roles: ["admin", "finance"] },
  { key: "reports", label: "Reports", icon: "📑", roles: ["admin", "finance"] },
  { key: "users", label: "Users", icon: "👥", roles: ["admin"] },
  { key: "audit", label: "Audit Logs", icon: "🔍", roles: ["admin"] },
];