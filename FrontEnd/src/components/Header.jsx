import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export default function Header({ user }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleAuthClick = () => {
    if (user) {
      navigate("/admin");
    } else {
      navigate("/signingsignup");
    }
  };

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 border-b border-white/[0.06]"
      style={{
        background: "rgba(5, 7, 18, 0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="cursor-pointer flex items-center gap-2"
          onClick={() => navigate("/")}
        >
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
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
                  onClick={() => navigate("/")}
                >
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="px-4 py-2 text-sm text-slate-300 hover:text-white bg-transparent hover:bg-white/5 data-[state=open]:bg-white/5">
                  About
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div
                    className="p-5 w-[320px] rounded-xl text-sm text-slate-300 leading-relaxed"
                    style={{
                      background: "rgba(13, 20, 37, 0.95)",
                      border: "1px solid rgba(26,110,250,0.2)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    MetaHire is an AI-powered interview platform built to help
                    developers sharpen their skills with resume-aware mock
                    interviews, real-time proctoring, and detailed feedback.
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="px-4 py-2 text-sm text-slate-300 hover:text-white bg-transparent hover:bg-white/5 data-[state=open]:bg-white/5">
                  Contact
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul
                    className="p-4 w-[280px] space-y-3"
                    style={{
                      background: "rgba(13, 20, 37, 0.95)",
                      border: "1px solid rgba(26,110,250,0.2)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <li>
                      <a
                        href="mailto:rishabhsaini1098@gmail.com"
                        className="flex items-center gap-2 text-sm text-slate-300 hover:text-blue-400 transition-colors"
                      >
                        rishabhsaini1098@gmail.com
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.linkedin.com/in/rishabhsaini1098/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-slate-300 hover:text-blue-400 transition-colors"
                      >
                        LinkedIn → rishabhsaini1098
                      </a>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
                  asChild
                >
                  <a
                    href="https://github.com/Rishabh-1098git/MetaHire"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Auth Button + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAuthClick}
            className="hidden md:flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-lg transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #1A6EFA, #0ea5e9)",
              boxShadow: "0 0 20px rgba(26,110,250,0.3)",
              color: "#fff",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 32px rgba(26,110,250,0.5)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 20px rgba(26,110,250,0.3)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {user ? "Dashboard" : "Get Started"}
          </button>

          <button
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-white/[0.06]"
            style={{ background: "rgba(5, 7, 18, 0.95)" }}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <button
                onClick={() => { navigate("/"); setMobileOpen(false); }}
                className="text-left text-sm text-slate-300 hover:text-white py-2 border-b border-white/5"
              >
                Home
              </button>
              <a
                href="mailto:rishabhsaini1098@gmail.com"
                className="text-sm text-slate-300 hover:text-white py-2 border-b border-white/5"
              >
                Contact
              </a>
              <a
                href="https://github.com/Rishabh-1098git/MetaHire"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-300 hover:text-white py-2 border-b border-white/5"
              >
                GitHub
              </a>
              <button
                onClick={() => { handleAuthClick(); setMobileOpen(false); }}
                className="text-sm font-medium px-4 py-2.5 rounded-lg text-white mt-1"
                style={{ background: "linear-gradient(135deg, #1A6EFA, #0ea5e9)" }}
              >
                {user ? "Dashboard" : "Get Started"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
