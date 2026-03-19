const STATUS_STYLES = {
  Approved:  "bg-emerald-900/60 text-emerald-300 border-emerald-700",
  Pending:   "bg-amber-900/60  text-amber-300  border-amber-700",
  Rejected:  "bg-rose-900/60   text-rose-300   border-rose-700",
  Active:    "bg-indigo-900/60 text-indigo-300 border-indigo-700",
  Archived:  "bg-zinc-800      text-zinc-400   border-zinc-600",
  Received:  "bg-emerald-900/60 text-emerald-300 border-emerald-700",
  Completed: "bg-cyan-900/60   text-cyan-300   border-cyan-700",
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] ?? "bg-zinc-800 text-zinc-300 border-zinc-600";
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {status}
    </span>
  );
};

export default StatusBadge;