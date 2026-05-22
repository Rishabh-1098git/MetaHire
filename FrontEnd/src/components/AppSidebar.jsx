"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  ChevronsUpDown,
  UserCircle,
  Video,
  History,
  MessageCircleMore,
  SquarePi,
  Anvil,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "./ui/separator";
import { getCachedUser, setCachedUser } from "@/lib/userCache";

export function AddSidebar({ setActiveComponent }) {
  const [userData, setUserData] = useState(null);
  const [active, setActive] = useState("Practice Interview");
  const navigate = useNavigate();

  const menuItems = [
    { title: "Practice Interview", icon: Video },
    { title: "Interview History", icon: History },
    { title: "Profile", icon: UserCircle },
    { title: "Perfomance Analysis", icon: Anvil },
    { title: "Recommended Courses", icon: SquarePi },
    { title: "Community", icon: MessageCircleMore },
  ];

  useEffect(() => {
    const fetchProfileData = async () => {
      const cached = getCachedUser();
      if (cached) { setUserData(cached); return; }
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BASE_URL}/api/auth/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCachedUser(data);
        setUserData(data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfileData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  const handleSelect = (title) => {
    setActive(title);
    setActiveComponent(title);
  };

  return (
    <Sidebar className="font-mainFont border-r border-white/[0.07]">
      <SidebarContent className="flex flex-col h-full">
        {/* Brand */}
        <div className="px-4 py-5">
          <span
            className="text-xl font-bold font-display"
            style={{
              background: "linear-gradient(135deg, #818cf8, #22d3ee)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            MetaHire
          </span>
          <p className="text-xs text-slate-500 mt-0.5">AI Interview Platform</p>
        </div>

        <Separator className="opacity-20" />

        <SidebarGroup className="flex-1 mt-2">
          <SidebarGroupLabel className="text-xs uppercase tracking-widest text-slate-500 px-4 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = active === item.title;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <button
                        onClick={() => handleSelect(item.title)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                          isActive
                            ? "text-white font-medium"
                            : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                        }`}
                        style={
                          isActive
                            ? {
                                background: "rgba(99,102,241,0.15)",
                                boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.28)",
                              }
                            : {}
                        }
                      >
                        <item.icon
                          size={16}
                          className={isActive ? "text-indigo-400" : "text-slate-500"}
                        />
                        <span>{item.title}</span>
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User footer */}
        <div className="mt-auto border-t border-white/[0.07] p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/[0.04] transition-colors duration-150">
                <Avatar className="h-8 w-8 ring-2 ring-indigo-500/30">
                  <AvatarImage src={userData?.photoUrl} alt={userData?.name} />
                  <AvatarFallback
                    className="text-sm font-medium"
                    style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8" }}
                  >
                    {getInitial(userData?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left flex-1 min-w-0">
                  <span className="font-medium text-sm text-slate-200 truncate w-full">
                    {userData?.name || "User"}
                  </span>
                  <span className="text-xs text-slate-500 truncate w-full">
                    {userData?.email}
                  </span>
                </div>
                <ChevronsUpDown size={14} className="text-slate-500 flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-52 border-white/10"
              style={{ background: "rgba(10,14,26,0.98)", backdropFilter: "blur(12px)" }}
            >
              <DropdownMenuLabel>
                <div className="flex items-center gap-2 py-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userData?.photoUrl} alt={userData?.name} />
                    <AvatarFallback
                      style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8" }}
                    >
                      {getInitial(userData?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-slate-200">
                    {userData?.name || "User"}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
