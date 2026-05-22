import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_BASE_URL}/api/auth/reset-password/${token}`,
        { password: formData.password }
      );
      setSuccess(true);
      toast.success("Password reset successful!");
      setTimeout(() => navigate("/signingsignup"), 1800);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 font-mainFont"
      style={{ background: "hsl(var(--background))" }}
    >
      {/* Background orbs */}
      <div
        className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(26,110,250,0.1), transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,212,255,0.06), transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <button
        onClick={() => navigate("/signingsignup")}
        className="fixed top-6 left-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors z-10"
      >
        <ArrowLeft size={16} />
        Back to sign in
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(13, 20, 37, 0.8)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 0 60px rgba(26,110,250,0.08)",
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <span
              className="text-2xl font-bold font-display"
              style={{
                background: "linear-gradient(135deg, #60a5fa, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              MetaHire
            </span>

            {success ? (
              <div className="mt-6 flex flex-col items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)" }}
                >
                  <ShieldCheck size={22} className="text-cyan-400" />
                </div>
                <h1 className="text-xl font-semibold text-white font-display">Password updated</h1>
                <p className="text-sm text-slate-400">Redirecting you to sign in…</p>
              </div>
            ) : (
              <>
                <div className="mt-4 flex items-center justify-center mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(26,110,250,0.1)", border: "1px solid rgba(26,110,250,0.2)" }}
                  >
                    <Lock size={18} className="text-blue-400" />
                  </div>
                </div>
                <h1 className="text-xl font-semibold text-white font-display">Set new password</h1>
                <p className="text-sm text-slate-400 mt-1">Choose something strong and memorable</p>
              </>
            )}
          </div>

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 text-sm">
                  New password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300 text-sm">
                  Confirm password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50 h-11"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-medium mt-2"
                style={{
                  background: "linear-gradient(135deg, #1A6EFA, #0ea5e9)",
                  boxShadow: "0 0 20px rgba(26,110,250,0.25)",
                }}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting…</>
                ) : (
                  "Reset password"
                )}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
