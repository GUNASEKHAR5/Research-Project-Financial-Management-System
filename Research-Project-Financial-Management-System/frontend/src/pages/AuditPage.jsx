import { useState, useEffect } from "react";
import Card from "../components/Card";
import { Spinner, ErrorMsg } from "../components/PageState";
import { getAuditLogs, getAuditStats } from "../services/auditService";
import { getInitials, auditDotColor } from "../utils/helpers";

const PAGE_SIZE = 20;

const AuditPage = () => {
  const [logs,    setLogs]    = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [offset,  setOffset]  = useState(0);
  const [total,   setTotal]   = useState(0);

  const load = async (off = 0) => {
    setLoading(true); setError("");
    try {
      const [logRes, statsRes] = await Promise.all([
        getAuditLogs({ limit: PAGE_SIZE, offset: off }),
        getAuditStats(),
      ]);
      setLogs(logRes.data);
      setTotal(logRes.total);
      setStats(statsRes);
      setOffset(off);
    } catch { setError("Failed to load audit logs."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(0); }, []);

  // Derive dot color from action string
  const getDotColor = (action = "") => {
    if (action.includes("approved"))  return "bg-emerald-400";
    if (action.includes("rejected"))  return "bg-rose-400";
    if (action.includes("created"))   return "bg-indigo-400";
    if (action.includes("submitted")) return "bg-cyan-400";
    if (action.includes("recorded") || action.includes("verified")) return "bg-amber-400";
    return "bg-zinc-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Audit Logs</h2>
        <p className="text-zinc-500 text-sm mt-1">Complete system activity trail</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {[
          { color: "bg-emerald-400", label: "Approved"  },
          { color: "bg-rose-400",    label: "Rejected"  },
          { color: "bg-indigo-400",  label: "Created"   },
          { color: "bg-cyan-400",    label: "Submitted" },
          { color: "bg-amber-400",   label: "Recorded"  },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-zinc-400">
            <div className={`w-2 h-2 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>

      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={() => load(0)} /> : (
        <>
          {/* Log list */}
          <Card>
            <div className="divide-y divide-zinc-800">
              {logs.length === 0 ? (
                <p className="px-5 py-10 text-center text-zinc-500 text-sm">No audit logs found.</p>
              ) : logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-zinc-800/30 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-xs font-bold flex-shrink-0 mt-0.5">
                    {getInitials(log.user_name || "SY")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">{log.user_name || "System"}</span>
                      <span className="text-zinc-400 text-sm">{log.action?.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-zinc-500">
                      {log.project_title && <span>📁 {log.project_title}</span>}
                      <span>·</span>
                      <span>🕐 {new Date(log.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 pt-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${getDotColor(log.action)}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pagination */}
          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">
                Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={offset === 0}
                  onClick={() => load(offset - PAGE_SIZE)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 rounded-lg text-xs transition-colors">
                  ← Prev
                </button>
                <button
                  disabled={offset + PAGE_SIZE >= total}
                  onClick={() => load(offset + PAGE_SIZE)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 rounded-lg text-xs transition-colors">
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Approvals",   count: stats.total_approvals,  color: "text-emerald-400" },
                { label: "Rejections",  count: stats.total_rejections, color: "text-rose-400"    },
                { label: "Submissions", count: stats.total_submitted,  color: "text-cyan-400"    },
                { label: "Created",     count: stats.total_created,    color: "text-indigo-400"  },
              ].map((s) => (
                <Card key={s.label} className="p-4 text-center">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
                  <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuditPage;