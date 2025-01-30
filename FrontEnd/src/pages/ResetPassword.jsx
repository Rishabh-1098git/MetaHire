import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
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
import { FourSquare } from "react-loading-indicators";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast("Passwords don't match!", {
        variant: "destructive",
      });
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast("Password must be at least 6 characters long!", {
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_BASE_URL
        }/api/auth/reset-password/${token}`,
        { password: formData.password }
      );

      toast("Password reset successful!", {
        description: "You can now login with your new password.",
        duration: 4000,
      });

      // Redirect to login page after successful reset
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      toast(error.response?.data?.message || "Failed to reset password", {
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Navigation links (matching your AuthPage)
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
        {loading ? (
          <FourSquare color="#2563EB" size="medium" text="" textColor="" />
        ) : (
          <div className="w-full max-w-md">
            <Card className="shadow-lg bg-black bg-opacity-50 pb-6 shadow-blue-800">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Reset Password
                </CardTitle>
                <CardDescription className="text-center">
                  Enter your new password to reset your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        required
                        className="bg-black bg-opacity-50"
                        minLength={6}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        required
                        className="bg-black bg-opacity-50"
                        minLength={6}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Resetting Password..." : "Reset Password"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/")}
                      disabled={loading}
                    >
                      Back to Login
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default ResetPassword;
