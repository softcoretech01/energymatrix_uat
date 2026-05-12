import React, { useEffect, useState, useCallback } from "react";
import api from "@/services/api";
import { 
  AlertTriangle, 
  Activity, 
  Layers, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Terminal,
  Globe,
  Clock,
  Server,
  Monitor
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ErrorLog {
  id: number;
  user_id: number | null;
  page_name: string | null;
  module_name: string | null;
  error_message: string;
  error_stack: string | null;
  endpoint: string | null;
  method: string | null;
  browser_info: string | null;
  ip_address: string | null;
  created_at: string;
}

interface ErrorSummary {
  total_all_time: number;
  errors_today: number;
  modules_affected: number;
}

/* ── helpers ── */
function fmt(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

const METHOD_COLORS: Record<string, string> = {
  GET:    "bg-blue-100 text-blue-700 border-blue-200",
  POST:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  PUT:    "bg-amber-100 text-amber-700 border-amber-200",
  PATCH:  "bg-orange-100 text-orange-700 border-orange-200",
  DELETE: "bg-red-100 text-red-700 border-red-200",
};

const MODULE_COLORS: Record<string, string> = {
  Backend: "bg-purple-100 text-purple-700 border-purple-200",
  Frontend: "bg-sky-100 text-sky-700 border-sky-200",
  "Frontend-API": "bg-sky-100 text-sky-700 border-sky-200",
  "Backend-API": "bg-purple-100 text-purple-700 border-purple-200",
};

/* ── component ── */
export default function ErrorLogsPage() {
  const [logs, setLogs]       = useState<ErrorLog[]>([]);
  const [summary, setSummary] = useState<ErrorSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  // filters
  const [filterModule, setFilterModule] = useState("");
  const [filterPage, setFilterPage]     = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "200", offset: "0" };
      if (filterModule) params.module_name = filterModule;
      if (filterPage)   params.page_name   = filterPage;

      const [logsRes, sumRes] = await Promise.all([
        api.get("/error-logs/", { params }),
        api.get("/login-logs/error-summary"),
      ]);
      setLogs(logsRes.data);
      setSummary(sumRes.data);
    } catch (err) {
      console.error("Failed to fetch error logs", err);
    } finally {
      setLoading(false);
    }
  }, [filterModule, filterPage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* unique module names for the filter dropdown */
  const uniqueModules = Array.from(new Set(logs.map(l => l.module_name).filter(Boolean)));

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">

      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-lg shadow-red-200">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              Error Logs
            </h1>
            <p className="text-slate-500 text-sm">
              Centralised error trail — backend exceptions, API failures, and frontend crashes.
            </p>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Errors (All Time)", value: summary.total_all_time, icon: Activity, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
            { label: "Errors Today",            value: summary.errors_today,    icon: Clock,    color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
            { label: "Modules Affected",         value: summary.modules_affected,icon: Server,   color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
          ].map(c => (
            <div key={c.label} className={`${c.bg} border ${c.border} rounded-2xl p-6 shadow-sm transition-all hover:shadow-md`}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {c.label}
                </span>
                <c.icon size={16} className={c.color} />
              </div>
              <p className={`text-4xl font-extrabold ${c.color}`}>
                {c.value ?? "—"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex gap-2 items-center bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm">
          <select
            value={filterModule}
            onChange={e => setFilterModule(e.target.value)}
            className="px-3 py-1.5 rounded-lg border-none text-sm bg-transparent cursor-pointer min-w-[160px] focus:ring-0 outline-none"
          >
            <option value="">All Modules</option>
            {uniqueModules.map(m => <option key={m!} value={m!}>{m}</option>)}
          </select>

          <div className="h-6 w-[1px] bg-slate-200 mx-1" />

          <div className="flex items-center px-2 text-slate-400">
            <Monitor size={14} />
          </div>
          <input
            placeholder="Filter by page name…"
            value={filterPage}
            onChange={e => setFilterPage(e.target.value)}
            className="px-2 py-1.5 rounded-lg border-none text-sm bg-transparent outline-none w-[200px]"
          />
        </div>

        <Button 
          onClick={fetchData} 
          className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-5 h-11 flex gap-2 items-center transition-all shadow-md shadow-red-100"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>

        <div className="ml-auto flex items-center gap-2 text-slate-400 text-sm font-medium">
          <Badge variant="outline" className="bg-slate-100 border-slate-200 text-slate-600 font-bold px-2.5">
            {logs.length}
          </Badge>
          <span>records found</span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <RefreshCw size={32} className="text-slate-300 animate-spin" />
            <span className="text-slate-400 font-medium italic">Loading error logs…</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
              <Activity size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Errors Found</h3>
            <p className="text-slate-400 max-w-xs mx-auto">🎉 Great news! The system looks clean and no errors have been recorded recently.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  {["#", "Module", "Page", "Error Message", "Method / Endpoint", "IP", "Time", "Action"].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log, idx) => {
                  const isOpen = expanded === log.id;
                  const mBadgeClass = METHOD_COLORS[log.method ?? ""] ?? "bg-slate-100 text-slate-600 border-slate-200";
                  const modBadgeClass = MODULE_COLORS[log.module_name ?? ""] ?? "bg-slate-100 text-slate-600 border-slate-200";

                  return (
                    <React.Fragment key={log.id}>
                      <tr className={`group transition-colors hover:bg-slate-50/80 ${isOpen ? "bg-slate-50/50" : ""}`}>
                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">{log.id}</td>

                        <td className="px-6 py-4">
                          <Badge variant="outline" className={`${modBadgeClass} font-bold text-[10px] px-2 py-0.5 border`}>
                            {log.module_name ?? "—"}
                          </Badge>
                        </td>

                        <td className="px-6 py-4 max-w-[180px]">
                          <div className="text-slate-600 text-xs font-medium truncate" title={log.page_name ?? ""}>
                            {log.page_name ?? "—"}
                          </div>
                        </td>

                        <td className="px-6 py-4 max-w-[300px]">
                          <div className="text-red-600 text-xs font-semibold line-clamp-1 break-all" title={log.error_message}>
                            {log.error_message}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              {log.method && (
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase ${mBadgeClass}`}>
                                  {log.method}
                                </span>
                              )}
                              <span className="text-slate-500 font-mono text-[11px] truncate max-w-[150px]">
                                {log.endpoint ?? "—"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                            <Globe size={12} className="text-slate-300" />
                            {log.ip_address ?? "—"}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-slate-500 text-[11px] font-medium">
                            {fmt(log.created_at)}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {log.error_stack && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpanded(isOpen ? null : log.id)}
                              className={`h-8 px-3 text-[11px] font-bold flex gap-2 items-center transition-all border ${
                                isOpen 
                                  ? "bg-slate-200 text-slate-900 border-slate-300" 
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-red-600 hover:border-red-200"
                              }`}
                            >
                              <Layers size={13} className={isOpen ? "text-slate-900" : "text-slate-400 group-hover:text-red-500"} />
                              {isOpen ? "Hide" : "Stack"}
                              {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </Button>
                          )}
                        </td>
                      </tr>

                      {/* expandable stack trace row */}
                      {isOpen && (
                        <tr>
                          <td colSpan={8} className="px-6 pb-6 pt-0 bg-slate-50/50">
                            <div className="bg-[#1e1e2e] rounded-xl shadow-inner border border-slate-800 overflow-hidden">
                              <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Terminal size={14} className="text-red-400" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stack Trace</span>
                                </div>
                                <span className="text-[9px] text-slate-500 font-mono">Error ID: #{log.id}</span>
                              </div>
                              <pre className="p-5 text-[#cdd6f4] text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto">
                                {log.error_stack}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
