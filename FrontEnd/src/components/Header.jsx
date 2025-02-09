import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export default function Header({ user }) {
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (user) {
      navigate("/admin"); // Navigate to admin page if authenticated
    } else {
      navigate("/signingsignup"); // Navigate to AuthPage if not authenticated
    }
  };

  return (
    <header className="text-white fixed top-0 left-0 w-full shadow-lg bg-black bg-opacity-30 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          {"MetaHire"}
        </motion.div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-lg">
          <NavigationMenu>
            <NavigationMenuList>
              {/* Home Link */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={
                    navigationMenuTriggerStyle() +
                    " cursor-pointer bg-black bg-opacity-50"
                  }
                  onClick={() => navigate("/")}
                >
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* About Us Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-black bg-opacity-50">
                  About Us
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[300px]">
                    <li>
                      <NavigationMenuLink asChild>
                        <a className="block text-sm hover:underline">
                          Welcome to MetaHire, a platform built with the vision
                          of revolutionizing technical interviews. As a solo
                          developer passionate about solving real-world problems
                          through technology, I created MOCKAI to provide an
                          AI-driven interview experience that helps individuals
                          sharpen their skills.
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Contact Us Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-black bg-opacity-50">
                  Contact Us
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[300px]">
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          href="mailto:rishabhsaini1098@gmail.com"
                          className="block text-sm hover:underline"
                        >
                          Gmail: rishabhsaini1098@gmail.com
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          href="https://www.linkedin.com/in/rishabhsaini1098/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm hover:underline"
                        >
                          LinkedIn: rishabhsaini1098
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  className={
                    navigationMenuTriggerStyle() +
                    " cursor-pointer bg-black bg-opacity-50"
                  }
                >
                  <a href="https://github.com/Rishabh-1098git/MockAI">
                    {" "}
                    Github
                  </a>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center space-x-4">
          {!user ? (
            <button
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-5 rounded-lg shadow-md hover:shadow-lg hover:from-purple-400 hover:to-blue-400 transition-all"
              onClick={handleAuthClick}
            >
              Sign In / Sign Up
            </button>
          ) : (
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={handleAuthClick}
            >
              <img
                src={user.avatar}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="hidden md:block font-medium">{user.name}</span>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <button
            className="text-white focus:outline-none"
            aria-label="Open Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 5.25h16.5m-16.5 6h16.5m-16.5 6h16.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
