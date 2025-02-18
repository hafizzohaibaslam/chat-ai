"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useState } from "react";
import { SidebarUserNav } from "./sidebar-user-nav";
import { SidebarHistory } from "./sidebar-history";

// Define the initial dummy chat history
const initialDummyHistory = [
  {
    id: "1",
    title: "Chat about AI",
    createdAt: new Date(),
    visibility: "public",
    userId: "user1",
  },
  {
    id: "2",
    title: "Yesterday's chat",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    visibility: "private",
    userId: "user1",
  },
  {
    id: "3",
    title: "Last week chat",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 7)),
    visibility: "public",
    userId: "user1",
  },
];

export function AppSidebar() {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [chatHistory, setChatHistory] = useState(initialDummyHistory);

  const addNewChat = () => {
    const newChat = {
      id: Date.now().toString(), // Use a timestamp for a unique ID
      title: "New Chat - " + new Date().toLocaleDateString(),
      createdAt: new Date(),
      visibility: "public",
      userId: "user1",
    };
    setChatHistory((prev) => [newChat, ...prev]);
    router.push(`/chat/${newChat.id}`);
  };

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => setOpenMobile(false)}
              className="flex flex-row gap-3 items-center"
            >
              <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                Chatbot
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="p-2 h-fit"
                  onClick={() => {
                    setOpenMobile(false);
                    addNewChat();
                  }}
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">New Chat</TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
        />
      </SidebarContent>
      <SidebarFooter>{/* <SidebarUserNav /> */}</SidebarFooter>
    </Sidebar>
  );
}
