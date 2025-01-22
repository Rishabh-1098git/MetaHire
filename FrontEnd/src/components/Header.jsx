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
          {"MockAI"}
        </motion.div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-lg">
          <NavigationMenu>
            <NavigationMenuList>
              {/* Home Link */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle() + " cursor-pointer"}
                  onClick={() => navigate("/")}
                >
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* About Us Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>About Us</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[300px]">
                    <li>
                      <NavigationMenuLink
                        asChild
                        onClick={() => navigate("/about/team")}
                      >
                        <a className="block text-sm hover:underline">
                          Our Team
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink
                        asChild
                        onClick={() => navigate("/about/mission")}
                      >
                        <a className="block text-sm hover:underline">
                          Our Mission
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Contact Us Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Contact Us</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[300px]">
                    <li>
                      <NavigationMenuLink
                        asChild
                        onClick={() => navigate("/contact/support")}
                      >
                        <a className="block text-sm hover:underline">
                          Customer Support
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink
                        asChild
                        onClick={() => navigate("/contact/careers")}
                      >
                        <a className="block text-sm hover:underline">Careers</a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle() + " cursor-pointer"}
                  onClick={() => navigate("/")}
                >
                  Github
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center space-x-4">
          {!user ? (
            <button
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-purple-400 hover:to-blue-400 transition-all"
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
