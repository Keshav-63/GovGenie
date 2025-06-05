"use client"
import { useState, useEffect, useRef } from "react";
import axios from "axios";

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error parsing JWT:", error);
      return null;
    }
  };
import { Bell, MessageSquare, Sun, Moon, Menu } from "lucide-react"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useTheme } from "./theme-provider"
import { useAuthStore } from "../store/authStore";




function Header({ sidebarOpen, setSidebarOpen }) {
  const { theme, setTheme } = useTheme();
  const { user, logout, setAgentId, agentId } = useAuthStore();
  const [message, setMessage] = useState("");
  const [agentInfo, setAgentInfo] = useState(null);

  useEffect(() => {
    if (agentId) {
  
      axios
        .get(`http://localhost:5000/api/agentinfo-schema/${agentId}`)
        .then((response) => {
          setAgentInfo(response.data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [agentId]);

  useEffect(() => { 
    console.log("Agent Info: ", agentInfo);
    console.log("Agent profilePhoto: ", agentInfo?.profilePhoto);
  }, [agentInfo]);


  

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (!storedToken) {
      setMessage("Authentication token is missing. Please log in again.");
      return;
    }
    const decodedToken = parseJwt(storedToken);
    if (decodedToken.userId) {
      setAgentId(decodedToken.userId);

    } else {
      setMessage("Invalid session. Please log in again.");
    }
  }, []);

  useEffect(() => {
    console.log("Agent ID: ", agentId);
  }, [agentId]);

	const handleLogout = () => {
		logout();
	};
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div className="flex items-center gap-4">


        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={agentInfo?.profilePhoto}
                  alt="Agent"
                />
                <AvatarFallback>AG</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button onClick={handleLogout}>Log out</button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default Header

