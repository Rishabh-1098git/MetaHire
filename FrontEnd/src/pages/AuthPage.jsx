import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { Loader2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setIsForgotPassword(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isSignUp ? "/api/auth/signup" : "/api/auth/signin";
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BASE_URL}${url}`,
        formData
      );
      localStorage.setItem("token", data.token);
      toast(isSignUp ? "Account created successfully!" : "Logged in successfully!");
      setTimeout(() => navigate("/admin"), 500);
    } catch (error) {
      toast(error.response?.data?.message || "An error occurred", {
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_BASE_URL}/api/auth/forget-password`,
        { email: forgotEmail }
      );
      toast("Reset link sent! Check your email.");
      setIsForgotPassword(false);
      setForgotEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast("Sign in with Google coming soon!");
  };

  const title = isForgotPassword
    ? "Reset password"
    : isSignUp
    ? "Create account"
    : "Welcome back";

  const subtitle = isForgotPassword
    ? "Enter your email and we'll send a reset link"
    : isSignUp
    ? "Start your AI interview journey today"
    : "Sign in to continue to MetaHire";

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

      {/* Back to home */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors z-10"
      >
        <ArrowLeft size={16} />
        Home
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Card */}
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
            <h1 className="text-xl font-semibold text-white mt-4 font-display">{title}</h1>
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          </div>

          <AnimatePresence mode="wait">
            {isForgotPassword ? (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleForgotPassword}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="forgotEmail" className="text-slate-300 text-sm">
                    Email address
                  </Label>
                  <Input
                    id="forgotEmail"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
                  />
                </div>
                <Button
                  disabled={loading}
                  type="submit"
                  className="w-full h-11 font-medium"
                  style={{ background: "linear-gradient(135deg, #1A6EFA, #0ea5e9)" }}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full text-sm text-slate-400 hover:text-white transition-colors py-2"
                >
                  ← Back to sign in
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="auth"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 text-sm">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-300 text-sm">
                      Password
                    </Label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
                  />
                </div>

                <Button
                  disabled={loading}
                  type="submit"
                  className="w-full h-11 font-medium mt-2"
                  style={{
                    background: "linear-gradient(135deg, #1A6EFA, #0ea5e9)",
                    boxShadow: "0 0 20px rgba(26,110,250,0.25)",
                  }}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isSignUp ? "Creating..." : "Signing in..."}</>
                  ) : isSignUp ? (
                    "Create account"
                  ) : (
                    "Sign in"
                  )}
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/[0.08]" />
                  </div>
                  <div className="relative flex justify-center text-xs text-slate-500">
                    <span className="px-3" style={{ background: "rgba(13,20,37,0.8)" }}>
                      or
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border border-white/10 text-sm text-slate-300 hover:bg-white/[0.04] hover:text-white transition-all duration-150"
                >
                  <FcGoogle size={18} />
                  Continue with Google
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {!isForgotPassword && (
            <p className="text-center text-sm text-slate-500 mt-6">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={toggleMode}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
