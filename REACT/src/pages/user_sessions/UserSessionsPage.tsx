import React, { useEffect, useState } from "react";
import api from "@/services/api";

interface Session {
  id: number;
  user_id: number;
  user_name: string;
  login_time: string;
  logout_time: string | null;
  ip_address: string | null;
  browser_info: string | null;
  status: "ACTIVE" | "LOGGED_OUT" | "EXPIRED";
}

interface Summary {
  total_all_time: number;
  currently_active: number;
  logins_today: number;
  logouts_today: number;
}

const statusStyle: Record<string, React.CSSProperties> = {
  ACTIVE:      { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" },
  LOGGED_OUT:  { background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" },
  EXPIRED:     { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" },
};

function formatDate(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });
}

function duration(login: string, logout: string | null) {
  if (!logout) return "Active now";
  const ms = new Date(logout).getTime() - new Date(login).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function UserSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "200", offset: "0" };
      if (filterName)   params.user_name = filterName;
      if (filterStatus) params.status    = filterStatus;

      const [sessRes, sumRes] = await Promise.all([
        api.get("/sessions/", { params }),
        api.get("/sessions/summary"),
      ]);
      setSessions(sessRes.data);
      setSummary(sumRes.data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterName, filterStatus]);

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
          User Login / Logout History
        </h1>
        <p style={{ color: "#64748b", marginTop: "4px", fontSize: "14px" }}>
          Tracks every login and logout event across all pages and modules.
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "28px" }}>
          {[
            { label: "Total Sessions (All Time)", value: summary.total_all_time,    color: "#2563eb" },
            { label: "Currently Active",           value: summary.currently_active,  color: "#059669" },
            { label: "Logins Today",               value: summary.logins_today,      color: "#7c3aed" },
            { label: "Logouts Today",              value: summary.logouts_today,     color: "#d97706" },
          ].map((card) => (
            <div key={card.label} style={{
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px",
              padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,.06)"
            }}>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>{card.label}</p>
              <p style={{ fontSize: "32px", fontWeight: 700, color: card.color, margin: "8px 0 0" }}>
                {card.value ?? "—"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center" }}>
        <input
          placeholder="Search by username…"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          style={{
            padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1",
            fontSize: "14px", width: "220px", outline: "none"
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1",
            fontSize: "14px", background: "#fff", cursor: "pointer"
          }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="LOGGED_OUT">Logged Out</option>
          <option value="EXPIRED">Expired</option>
        </select>
        <button
          onClick={fetchData}
          style={{
            padding: "8px 18px", borderRadius: "8px", background: "hsl(189 79% 27%)",
            color: "#fff", border: "none", fontSize: "14px", cursor: "pointer", fontWeight: 600
          }}
        >
          Refresh
        </button>
        <span style={{ marginLeft: "auto", color: "#94a3b8", fontSize: "13px" }}>
          {sessions.length} record{sessions.length !== 1 ? "s" : ""} found
        </span>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>Loading session history…</div>
        ) : sessions.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>No sessions found.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                {["#", "User", "Login Time", "Logout Time", "Duration", "Status", "IP Address", "Browser / Device"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#475569", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, idx) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "12px 16px", color: "#94a3b8" }}>{s.id}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>{s.user_name}</td>
                  <td style={{ padding: "12px 16px", color: "#334155" }}>{formatDate(s.login_time)}</td>
                  <td style={{ padding: "12px 16px", color: "#334155" }}>{formatDate(s.logout_time)}</td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>{duration(s.login_time, s.logout_time)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      ...statusStyle[s.status],
                      padding: "3px 10px", borderRadius: "20px",
                      fontSize: "12px", fontWeight: 600, display: "inline-block"
                    }}>
                      {s.status === "ACTIVE" ? "🟢 Active" : s.status === "LOGGED_OUT" ? "⚫ Logged Out" : "🟡 Expired"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b", fontFamily: "monospace" }}>
                    {s.ip_address ?? "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#94a3b8", maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      title={s.browser_info ?? ""}>
                    {s.browser_info ?? "—"}
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
