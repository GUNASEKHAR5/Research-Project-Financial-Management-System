import Card from "../components/Card";
import { AUDIT_LOGS } from "../data/mockData";
import { getInitials, auditDotColor } from "../utils/helpers";

const AuditPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Audit Logs</h2>
        <p className="text-zinc-500 text-sm mt-1">
          Complete system activity trail · {AUDIT_LOGS.length} recent entries
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {[
          { type: "approve", label: "Approved",  color: "bg-emerald-400" },
          { type: "reject",  label: "Rejected",  color: "bg-rose-400" },
          { type: "create",  label: "Created",   color: "bg-indigo-400" },
          { type: "submit",  label: "Submitted", color: "bg-cyan-400" },
          { type: "verify",  label: "Verified",  color: "bg-amber-400" },
        ].map((l) => (
          <div key={l.type} className="flex items-center gap-1.5 text-xs text-zinc-400">
            <div className={`w-2 h-2 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Log Entries */}
      <Card>
        <div className="divide-y divide-zinc-800">
          {AUDIT_LOGS.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 px-5 py-4 hover:bg-zinc-800/30 transition-colors"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-xs font-bold flex-shrink-0 mt-0.5">
                {getInitials(log.user)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold text-sm">{log.user}</span>
                  <span className="text-zinc-400 text-sm">{log.action}</span>
                </div>
                <div className="flex gap-3 mt-1 text-xs text-zinc-500">
                  <span>📁 {log.project}</span>
                  <span>·</span>
                  <span>🕐 {log.time}</span>
                </div>
              </div>

              {/* Status dot */}
              <div className="flex-shrink-0 pt-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${auditDotColor(log.type)}`} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Approvals",  count: AUDIT_LOGS.filter((l) => l.type === "approve").length,  color: "text-emerald-400" },
          { label: "Rejections", count: AUDIT_LOGS.filter((l) => l.type === "reject").length,   color: "text-rose-400" },
          { label: "Submissions",count: AUDIT_LOGS.filter((l) => l.type === "submit").length,   color: "text-cyan-400" },
          { label: "Created",    count: AUDIT_LOGS.filter((l) => l.type === "create").length,   color: "text-indigo-400" },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AuditPage;