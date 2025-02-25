"use client";

import React, { useState } from "react";
import { ChevronUp } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Import the signOut server action:
import { signOut } from "@/app/(auth)/action";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface SidebarUserNavProps {
  user: {
    email: string | null;
    id?: string;
    // Add any additional properties as needed
  };
}

export function SidebarUserNav({ user }: SidebarUserNavProps) {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);

    try {
      const response = await signOut();

      if (response.success) {
        toast.success("Signed out successfully!");
        router.push("/signin"); // Redirect instantly
      } else {
        toast.error("Error signing out. Please try again.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10">
              <Image
                src={`https://avatar.vercel.sh/${user.email}`}
                alt={user.email ?? "User Avatar"}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="truncate">{user.email}</span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            {/* Theme Toggle */}
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={(e) => {
                e.preventDefault(); // Prevent menu from closing
                setTheme(theme === "dark" ? "light" : "dark");
              }}
            >
              {`Toggle ${theme === "light" ? "dark" : "light"} mode`}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Sign Out Button */}
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSignOut}
                disabled={loading}
              >
                {loading ? "Signing out..." : "Sign out"}
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
