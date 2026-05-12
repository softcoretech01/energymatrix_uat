import React, { useEffect, useState, useCallback } from "react";
import api from "@/services/api";

/* ── Types ── */
interface LoginLog {
  id: number;
  user_name: string;
  login_time: string;
  login_status: "SUCCESS" | "FAILED";
  ip_address: string | null;
  browser_info: string | null;
}

interface LogoutLog {
  id: number;
  user_name: string;
  logout_time: string;
  ip_address: string | null;
  browser_info: string | null;
}

interface LoginSummary {
  total_all_time: number;
  logins_today: number;
  success_today: number;
  failed_today: number;
}

/* ── Helpers ── */
function fmt(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

type Tab = "login" | "logout";

/* ── Component ── */
export default function LoginLogsPage() {
  const [tab, setTab]             = useState<Tab>("login");
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [logoutLogs, setLogoutLogs] = useState<LogoutLog[]>([]);
  const [summary, setSummary]     = useState<LoginSummary | null>(null);
  const [loading, setLoading]     = useState(true);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "300", offset: "0" };
      if (filterName)   params.user_name = filterName;
      if (filterStatus) params.status    = filterStatus;

      const [loginRes, logoutRes, sumRes] = await Promise.all([
        api.get("/login-logs/", { params }),
        api.get("/login-logs/logout-logs", { params: { limit: "300", offset: "0", ...(filterName ? { user_name: filterName } : {}) } }),
        api.get("/login-logs/summary"),
      ]);
      setLoginLogs(loginRes.data);
      setLogoutLogs(logoutRes.data);
      setSummary(sumRes.data);
    } catch (err) {
      console.error("Failed to fetch login logs", err);
    } finally {
      setLoading(false);
    }
  }, [filterName, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── derived ── */
  const activeList = tab === "login" ? loginLogs : logoutLogs;

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8fafc" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "18px"
          }}>🔐</div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Login / Logout Logs
          </h1>
        </div>
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
          Audit trail of every authentication event — who logged in, when, and from where.
        </p>
      </div>

      {/* ── Summary Cards ── */}
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "28px" }}>
          {[
            { label: "Total Logins (All Time)", value: summary.total_all_time, color: "#2563eb", bg: "#eff6ff", border: "#93c5fd" },
            { label: "Logins Today",            value: summary.logins_today,   color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
            { label: "Successful Today",        value: summary.success_today,  color: "#059669", bg: "#f0fdf4", border: "#86efac" },
            { label: "Failed Today",            value: summary.failed_today,   color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
          ].map(c => (
            <div key={c.label} style={{
              background: c.bg, border: `1px solid ${c.border}`,
              borderRadius: "14px", padding: "20px 24px",
              boxShadow: "0 1px 4px rgba(0,0,0,.06)"
            }}>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0, fontWeight: 600,
                textTransform: "uppercase", letterSpacing: ".05em" }}>
                {c.label}
              </p>
              <p style={{ fontSize: "36px", fontWeight: 800, color: c.color, margin: "8px 0 0" }}>
                {c.value ?? "—"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab switcher ── */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px",
        background: "#f1f5f9", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
        {(["login", "logout"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: 600,
              border: "none", cursor: "pointer", transition: "all .2s",
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? "#1d4ed8" : "#64748b",
              boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,.1)" : "none"
            }}
          >
            {t === "login" ? "🔑 Login Events" : "🚪 Logout Events"}
          </button>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center", flexWrap: "wrap" }}>
        <input
          placeholder="Search by username…"
          value={filterName}
          onChange={e => setFilterName(e.target.value)}
          style={{
            padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1",
            fontSize: "14px", width: "220px", outline: "none"
          }}
        />

        {tab === "login" && (
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1",
              fontSize: "14px", background: "#fff", cursor: "pointer"
            }}
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>
        )}

        <button
          onClick={fetchData}
          style={{
            padding: "8px 20px", borderRadius: "8px",
            background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
            color: "#fff", border: "none", fontSize: "14px", cursor: "pointer", fontWeight: 600
          }}
        >
          Refresh
        </button>

        <span style={{ marginLeft: "auto", color: "#94a3b8", fontSize: "13px" }}>
          {activeList.length} record{activeList.length !== 1 ? "s" : ""} found
        </span>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: "#fff", border: "1px solid #e2e8f0",
        borderRadius: "14px", overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,.06)"
      }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>Loading logs…</div>
        ) : activeList.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>No records found.</div>
        ) : tab === "login" ? (

          /* ── Login table ── */
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#eff6ff", borderBottom: "1px solid #bfdbfe" }}>
                {["#", "Username", "Status", "Login Time", "IP Address", "Browser / Device"].map(h => (
                  <th key={h} style={{
                    padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#1e40af",
                    fontSize: "12px", textTransform: "uppercase", letterSpacing: ".04em", whiteSpace: "nowrap"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(loginLogs as LoginLog[]).map((log, idx) => {
                const isSuccess = log.login_status === "SUCCESS";
                return (
                  <tr key={log.id} style={{
                    borderBottom: "1px solid #f1f5f9",
                    background: idx % 2 === 0 ? "#fff" : "#fafafa"
                  }}>
                    <td style={{ padding: "12px 16px", color: "#94a3b8", fontFamily: "monospace" }}>{log.id}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>{log.user_name}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700,
                        background: isSuccess ? "#dcfce7" : "#fee2e2",
                        color: isSuccess ? "#15803d" : "#b91c1c",
                        border: `1px solid ${isSuccess ? "#86efac" : "#fca5a5"}`
                      }}>
                        {isSuccess ? "✓ SUCCESS" : "✗ FAILED"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#334155" }}>{fmt(log.login_time)}</td>
                    <td style={{ padding: "12px 16px", color: "#64748b", fontFamily: "monospace", fontSize: "12px" }}>
                      {log.ip_address ?? "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#94a3b8", maxWidth: "260px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      title={log.browser_info ?? ""}>
                      {log.browser_info ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

        ) : (

          /* ── Logout table ── */
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f0fdf4", borderBottom: "1px solid #bbf7d0" }}>
                {["#", "Username", "Logout Time", "IP Address", "Browser / Device"].map(h => (
                  <th key={h} style={{
                    padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#15803d",
                    fontSize: "12px", textTransform: "uppercase", letterSpacing: ".04em", whiteSpace: "nowrap"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(logoutLogs as LogoutLog[]).map((log, idx) => (
                <tr key={log.id} style={{
                  borderBottom: "1px solid #f1f5f9",
                  background: idx % 2 === 0 ? "#fff" : "#fafafa"
                }}>
                  <td style={{ padding: "12px 16px", color: "#94a3b8", fontFamily: "monospace" }}>{log.id}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>{log.user_name}</td>
                  <td style={{ padding: "12px 16px", color: "#334155" }}>{fmt(log.logout_time)}</td>
                  <td style={{ padding: "12px 16px", color: "#64748b", fontFamily: "monospace", fontSize: "12px" }}>
                    {log.ip_address ?? "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#94a3b8", maxWidth: "280px",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    title={log.browser_info ?? ""}>
                    {log.browser_info ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
