"use client";

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
  Edit,
  ChevronsUpDown,
  UserCircle,
  Video,
  History,
  LayoutDashboard,
  MessageCircleMore,
  SquarePi,
  Anvil,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "./ui/separator";
export function AddSidebar({ setActiveComponent }) {
  const user = {
    name: "Rishabh Saini",
    email: "rishabhsaini1098@gmail.com",
  };

  const navigate = useNavigate();

  const menuItems = [
    { title: "Profile", icon: UserCircle },
    { title: "Practice Interview", icon: Video },
    { title: "Interview History", icon: History },
    { title: "Perfomance Analysis", icon: Anvil },
    { title: "Recommended Courses", icon: SquarePi },
    { title: "Community", icon: MessageCircleMore },
  ];

  return (
    <Sidebar className="font-mainFont">
      <SidebarContent className="flex flex-col h-full">
        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xl mb-2 flex items-center gap-2">
            <LayoutDashboard className="size-5" />
            Dashboard
          </SidebarGroupLabel>
          <Separator />
          <SidebarGroupContent className="mt-8">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      className="flex items-center gap-2"
                      onClick={() => setActiveComponent(item.title)}
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sidebar Footer with Avatar */}
        <div className="mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 w-full p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 rounded-md">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left flex-1">
                  <span className="font-medium text-sm">{user.name}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
                <ChevronsUpDown className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="block text-sm font-medium">
                      {user.name}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Edit className="mr-2 size-4" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/")}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 size-4 curson-pointer" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
