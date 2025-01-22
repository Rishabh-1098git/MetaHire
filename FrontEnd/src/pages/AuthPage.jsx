import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
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
import { toast } from "sonner"; // Import the toast from sonner

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const toggleMode = () => setIsSignUp((prev) => !prev);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isSignUp ? "/api/auth/signup" : "/api/auth/signin";
    try {
      const { data } = await axios.post(
        `http://localhost:5000${url}`,
        formData
      );
      localStorage.setItem("token", data.token);

      toast(
        isSignUp ? "Account created successfully!" : "Logged in successfully!",
        {
          description: isSignUp
            ? "Welcome to the platform!"
            : "You're now logged in.",
          duration: 4000, // Optional: to set the duration for the toast
        }
      );

      setTimeout(() => navigate("/admin"), 1500);
    } catch (error) {
      toast(error.response?.data?.message || "An error occurred", {
        variant: "destructive", // Optional: style the error toast
      });
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
        <div className="w-full max-w-md ">
          <Card className="shadow-lg bg-black bg-opacity-50 pb-6 shadow-blue-800">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {isSignUp ? "Create an Account" : "Welcome Back"}
              </CardTitle>
              <CardDescription className="text-center">
                {isSignUp
                  ? "Enter your details to create a new account"
                  : "Enter your credentials to log in"}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  </div>
                  <Button type="submit" className="w-full">
                    {isSignUp ? "Sign Up" : "Sign In"}
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
            </CardContent>
            <div className="mt-4 text-center text-sm">
              {isSignUp ? "Already have an account?" : "Don’t have an account?"}{" "}
              <span
                className="underline underline-offset-4 cursor-pointer text-blue-700 mx-1 font-bold"
                onClick={toggleMode}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AuthPage;
