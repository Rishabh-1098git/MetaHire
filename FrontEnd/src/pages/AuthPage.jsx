import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import Header from "../components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

      toast(
        isSignUp ? "Account created successfully!" : "Logged in successfully!"
      );
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
      const { data } = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BASE_URL}/api/auth/forget-password`,
        { email: forgotEmail }
      );

      toast(
        "Reset link sent! Please check your email for the password reset link"
      );
      setIsForgotPassword(false);
      setForgotEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast("Sign in with Google feature coming soon!");
  };

  const links = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    {
      label: "Services",
      dropdown: [
        { label: "Consultation", href: "/services/consultation" },
        { label: "Premium Plans", href: "/services/premium" },
      ],
    },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <Header links={links} />
      <div className="flex items-center justify-center min-h-screen font-mainFont">
        <div className="w-full max-w-md">
          <Card className="shadow-lg bg-black bg-opacity-50 pb-6 shadow-blue-800">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {isForgotPassword
                  ? "Forgot Password"
                  : isSignUp
                  ? "Create an Account"
                  : "Welcome Back"}
              </CardTitle>
              <CardDescription className="text-center">
                {isForgotPassword
                  ? "Enter your email to receive a reset link"
                  : isSignUp
                  ? "Enter your details to create a new account"
                  : "Enter your credentials to log in"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isForgotPassword ? (
                // Forgot Password Form
                <form onSubmit={handleForgotPassword}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="forgotEmail">Email</Label>
                      <Input
                        id="forgotEmail"
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="bg-black bg-opacity-50"
                      />
                    </div>
                    <Button disabled={loading} type="submit" className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsForgotPassword(false)}
                    >
                      Back to Login
                    </Button>
                  </div>
                </form>
              ) : (
                // Login/Signup Form
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        className="bg-black bg-opacity-50"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        className="bg-black bg-opacity-50"
                      />
                      {!isSignUp && (
                        <div className="text-right">
                          <span
                            className="text-sm text-blue-700 hover:underline cursor-pointer"
                            onClick={() => setIsForgotPassword(true)}
                          >
                            Forgot Password?
                          </span>
                        </div>
                      )}
                    </div>
                    <Button disabled={loading} type="submit" className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isSignUp ? "Signing up..." : "Signing in..."}
                        </>
                      ) : isSignUp ? (
                        "Sign Up"
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center"
                      onClick={handleGoogleSignIn}
                    >
                      <FcGoogle className="text-2xl mr-2" />
                      <span className="text-gray-300 font-medium">
                        Sign in with Google
                      </span>
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
            {!isForgotPassword && (
              <div className="mt-4 text-center text-sm">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <span
                  className="underline underline-offset-4 cursor-pointer text-blue-700 mx-1 font-bold"
                  onClick={toggleMode}
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default AuthPage;
