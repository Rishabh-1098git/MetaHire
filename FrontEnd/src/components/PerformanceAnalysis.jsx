import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Trophy, Target, Zap, Building2, Calendar,
  ChevronRight, RefreshCw, BarChart2,
} from "lucide-react";
import { FourSquare } from "react-loading-indicators";
import { getCachedUser, setCachedUser } from "@/lib/userCache";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const scoreColor = (s) =>
  s >= 70 ? "#22d3ee" : s >= 40 ? "#6366F1" : "#f87171";

const scoreLabel = (s) =>
  s >= 70 ? "Excellent" : s >= 40 ? "Good" : "Needs Work";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return ""; }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div
    className="flex-1 min-w-0 rounded-xl p-4 flex flex-col gap-1"
    style={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.07)" }}
  >
    <div className="flex items-center gap-2 mb-1">
      <Icon size={13} style={{ color }} />
      <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
    <span className="text-2xl font-bold font-mono" style={{ color }}>
      {value ?? "—"}
    </span>
    {sub && <span className="text-xs text-slate-500">{sub}</span>}
  </div>
);

/* Bar chart — last 15 sessions */
const ScoreTrend = ({ feedbacks }) => {
  const recent = feedbacks.slice(-15);
  if (recent.length < 2) return null;
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-indigo-400" />
          <span className="text-sm font-semibold text-white">Score Trend</span>
        </div>
        <span className="text-xs text-slate-500">Last {recent.length} sessions</span>
      </div>
      <div className="flex items-end gap-1.5 h-28">
        {recent.map((f, i) => {
          const score = f.totalScore || 0;
          const color = scoreColor(score);
          const isLatest = i === recent.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div
                className="w-full rounded-t transition-all duration-300 cursor-default"
                style={{
                  height: `${Math.max(6, score)}%`,
                  background: isLatest ? color : `${color}60`,
                  border: isLatest ? `1px solid ${color}` : "none",
                }}
              />
              <div
                className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center gap-0.5 px-2 py-1 rounded text-xs font-mono font-bold whitespace-nowrap z-10"
                style={{ background: "rgba(10,14,26,0.95)", color, border: `1px solid ${color}30` }}
              >
                <span>{score}</span>
                <span className="text-slate-500 font-normal text-[10px]">{f.role || "—"}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-slate-600">Oldest</span>
        <span className="text-xs text-slate-600">Latest</span>
      </div>

      {/* Score scale guide */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.05]">
        {[
          { range: "70–100", label: "Excellent", color: "#22d3ee" },
          { range: "40–69", label: "Good", color: "#6366F1" },
          { range: "0–39", label: "Needs Work", color: "#f87171" },
        ].map((item) => (
          <div key={item.range} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm" style={{ background: item.color }} />
            <span className="text-xs text-slate-500">
              <span style={{ color: item.color }}>{item.range}</span> {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* SVG line chart — score over time */
const ScoreLine = ({ feedbacks }) => {
  const recent = feedbacks.slice(-20);
  if (recent.length < 3) return null;

  const W = 600, H = 120, PAD = 12;
  const scores = recent.map((f) => f.totalScore || 0);
  const max = Math.max(...scores, 100);
  const points = scores.map((s, i) => {
    const x = PAD + (i / (scores.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((s / max) * (H - PAD * 2));
    return `${x},${y}`;
  });
  const polyline = points.join(" ");
  const areaPath = `M ${points[0]} L ${points.join(" L ")} L ${W - PAD},${H - PAD} L ${PAD},${H - PAD} Z`;

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 size={14} className="text-cyan-400" />
        <span className="text-sm font-semibold text-white">Performance Over Time</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
        <defs>
          <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Gridlines */}
        {[25, 50, 75, 100].map((v) => {
          const y = H - PAD - ((v / max) * (H - PAD * 2));
          return (
            <g key={v}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <text x={PAD - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#475569">{v}</text>
            </g>
          );
        })}
        {/* Area fill */}
        <path d={areaPath} fill="url(#lineArea)" />
        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#6366F1"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Dots */}
        {points.map((pt, i) => {
          const [x, y] = pt.split(",").map(Number);
          const color = scoreColor(scores[i]);
          const isLatest = i === points.length - 1;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={isLatest ? 4 : 2.5}
              fill={color}
              stroke={isLatest ? "rgba(10,14,26,0.8)" : "none"}
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    </div>
  );
};

/* Per-role breakdown */
const RoleBreakdown = ({ feedbacks }) => {
  if (feedbacks.length === 0) return null;

  const byRole = {};
  feedbacks.forEach((f) => {
    const role = f.role || "Unknown";
    if (!byRole[role]) byRole[role] = [];
    byRole[role].push(f.totalScore || 0);
  });

  const rows = Object.entries(byRole)
    .map(([role, scores]) => ({
      role,
      count: scores.length,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      best: Math.max(...scores),
    }))
    .sort((a, b) => b.avg - a.avg);

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Target size={14} className="text-indigo-400" />
        <span className="text-sm font-semibold text-white">By Role</span>
      </div>
      <div className="space-y-3">
        {rows.map(({ role, count, avg, best }) => {
          const color = scoreColor(avg);
          return (
            <div key={role} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm text-slate-200 truncate">{role}</span>
                  <span className="text-xs text-slate-600 flex-shrink-0">×{count}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-slate-500">Best: <span className="font-mono" style={{ color }}>{best}</span></span>
                  <span className="text-xs font-bold font-mono" style={{ color }}>{avg} avg</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, avg)}%`,
                    background: `linear-gradient(90deg, ${color}60, ${color})`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* Recent sessions list */
const RecentSessions = ({ feedbacks, onNavigate }) => {
  const recent = [...feedbacks].reverse().slice(0, 5);
  if (recent.length === 0) return null;
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-indigo-400" />
          <span className="text-sm font-semibold text-white">Recent Sessions</span>
        </div>
        <button
          onClick={onNavigate}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 transition-colors"
        >
          View all <ChevronRight size={11} />
        </button>
      </div>
      <div className="space-y-2">
        {recent.map((f, i) => {
          const sc = f.totalScore || 0;
          const color = scoreColor(sc);
          return (
            <div
              key={i}
              className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold font-mono flex-shrink-0"
                  style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
                >
                  {sc}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{f.role || "Interview"}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Building2 size={10} className="text-slate-500" />
                    <span className="text-xs text-slate-500 truncate">{f.company || "—"}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0 ml-3">
                <span className="text-xs font-medium" style={{ color }}>{scoreLabel(sc)}</span>
                <span className="text-xs text-slate-600">{formatDate(f.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const PerformanceAnalysis = ({ onNavigate }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchData = async (force = false) => {
    if (!force) {
      const cached = getCachedUser();
      if (cached) {
        setFeedbacks(cached.feedbacks || []);
        setLoading(false);
        return;
      }
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      const { data } = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BASE_URL}/api/auth/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCachedUser(data);
      setFeedbacks(data.feedbacks || []);
    } catch (err) {
      setError("Failed to load performance data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <FourSquare color="#6366F1" size="medium" text="" textColor="" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-red-400 text-sm">{error}</p>
      <button
        onClick={handleRefresh}
        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
      >
        <RefreshCw size={12} /> Try again
      </button>
    </div>
  );

  if (feedbacks.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="text-4xl">📊</div>
      <p className="text-slate-400 text-sm text-center">
        No interview data yet. Complete a mock interview to see analytics.
      </p>
      <button
        onClick={() => onNavigate?.("Practice Interview")}
        className="text-xs font-semibold px-4 py-2 rounded-lg text-white"
        style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
      >
        Start Practice Interview
      </button>
    </div>
  );

  const allScores = feedbacks.map((f) => f.totalScore || 0);
  const sessions = feedbacks.length;
  const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / sessions);
  const bestScore = Math.max(...allScores);
  const latestScore = allScores[allScores.length - 1];
  const trend = sessions >= 2 ? latestScore - allScores[allScores.length - 2] : null;

  return (
    <div className="w-full font-mainFont space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold font-display text-white">Performance Analysis</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Based on {sessions} interview session{sessions !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Target} label="Sessions" value={sessions} color="#818cf8" sub="total interviews" />
        <StatCard
          icon={TrendingUp}
          label="Avg Score"
          value={avgScore}
          color={scoreColor(avgScore)}
          sub={scoreLabel(avgScore)}
        />
        <StatCard
          icon={Trophy}
          label="Best Score"
          value={bestScore}
          color={scoreColor(bestScore)}
          sub={scoreLabel(bestScore)}
        />
        <StatCard
          icon={Zap}
          label="Latest"
          value={latestScore}
          color={scoreColor(latestScore)}
          sub={trend !== null
            ? trend > 0 ? `+${trend} from prev` : trend < 0 ? `${trend} from prev` : "same as prev"
            : scoreLabel(latestScore)
          }
        />
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-4">
        <ScoreTrend feedbacks={feedbacks} />
        <ScoreLine feedbacks={feedbacks} />
      </div>

      {/* Bottom row */}
      <div className="grid md:grid-cols-2 gap-4">
        <RoleBreakdown feedbacks={feedbacks} />
        <RecentSessions feedbacks={feedbacks} onNavigate={() => onNavigate?.("Interview History")} />
      </div>
    </div>
  );
};

export default PerformanceAnalysis;
