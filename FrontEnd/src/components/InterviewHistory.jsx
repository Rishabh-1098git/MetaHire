import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Calendar, Building2, ChevronRight, RefreshCw } from "lucide-react";
import { getCachedUser, setCachedUser } from "@/lib/userCache";

const InterviewHistory = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchData = async (force = false) => {
    if (!force) {
      const cached = getCachedUser();
      if (cached?.feedbacks) {
        setFeedbackList(cached.feedbacks);
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
      setFeedbackList(data.feedbacks || []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load interview history.");
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

  const handleViewResults = (interview) => {
    navigate("/admin/view-interview", { state: { interview } });
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "#22d3ee";
    if (score >= 40) return "#6366F1";
    return "#f87171";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      });
    } catch { return ""; }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={handleRefresh}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <RefreshCw size={12} /> Try again
          </button>
        </div>
      </div>
    );
  }

  if (!feedbackList || feedbackList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-4xl">🎯</div>
        <p className="text-slate-400 text-sm text-center">
          No interviews yet. Start your first mock interview!
        </p>
        <Button
          onClick={() => navigate("/admin")}
          className="text-sm text-white"
          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
        >
          Start Interview
        </Button>
      </div>
    );
  }

  // Show newest first
  const sorted = [...feedbackList].reverse();

  return (
    <div className="w-full font-mainFont">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold font-display text-white">Interview History</h1>
          <p className="text-sm text-slate-400 mt-1">
            {feedbackList.length} session{feedbackList.length !== 1 ? "s" : ""} recorded
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((interview) => {
          const scoreColor = getScoreColor(interview.totalScore || 0);
          return (
            <button
              key={interview._id}
              onClick={() => handleViewResults(interview)}
              className="text-left rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 group"
              style={{
                background: "hsl(var(--card))",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "1px solid rgba(99,102,241,0.3)";
                e.currentTarget.style.boxShadow = "0 0 24px rgba(99,102,241,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">
                    {interview.role || "Interview"}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Building2 size={11} className="text-slate-500 flex-shrink-0" />
                    <span className="text-xs text-slate-400 truncate">{interview.company}</span>
                  </div>
                </div>
                <div
                  className="ml-3 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold font-mono"
                  style={{
                    background: `${scoreColor}15`,
                    color: scoreColor,
                    border: `1px solid ${scoreColor}30`,
                  }}
                >
                  {interview.totalScore || 0}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar size={11} />
                  <span>{formatDate(interview.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  <span>View</span>
                  <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div className="mt-3 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, interview.totalScore || 0)}%`,
                    background: `linear-gradient(90deg, ${scoreColor}70, ${scoreColor})`,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InterviewHistory;
