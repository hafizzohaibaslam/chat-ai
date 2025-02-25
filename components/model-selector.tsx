"use client";

import { startTransition, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatModel } from "@/lib/ai/models";
import { cn } from "@/lib/utils";

import { CheckCircleFillIcon, ChevronDownIcon } from "./icons";
import { getAccessTokenClient } from "@/utils/supabase/token";
import API, { createAPI } from "@/lib/axios";

export function ModelSelector({
  selectedModelId,
  className,
}: {
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [chatModels, setChatModels] = useState<ChatModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<ChatModel | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  console.log("selectedModel", selectedModel);

  // Load the selected model from localStorage on component mount
  useEffect(() => {
    async function fetchModels() {
      try {
        const API = await createAPI();

        const res = await API.get<{ models: ChatModel[] }>(
          "chat/available_models"
        );

        setChatModels(res.data.models);

        // Retrieve previously selected model from localStorage
        const savedModelId = localStorage.getItem("selectedModelId");

        const initialModel = res.data.models.find(
          (model) => model.id === (savedModelId || selectedModelId)
        );

        setSelectedModel(initialModel || res.data.models[0]); // Default to the first model if not found
      } catch (error) {
        console.error("Error fetching chat models:", error);
      }
    }

    fetchModels();
  }, [selectedModelId]); // Depend on `selectedModelId` so it updates when it changes

  // Store selected model in localStorage whenever it changes
  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem("selectedModelId", selectedModel.id);
    }
  }, [selectedModel]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className
        )}
      >
        <Button variant="outline" className="md:px-2 md:h-[34px]">
          {selectedModel ? selectedModel.name : "Select Model"}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {chatModels.map((chatModel) => (
          <DropdownMenuItem
            key={chatModel.id}
            onSelect={() => {
              setOpen(false);
              startTransition(() => {
                setSelectedModel(chatModel); // Update selection
                localStorage.setItem("selectedModelId", chatModel.id); // Persist selection
              });
            }}
            className={cn(
              "gap-4 group/item flex flex-row justify-between items-center",
              chatModel.id === selectedModel?.id &&
                "bg-accent text-accent-foreground"
            )}
          >
            <div className="flex flex-col gap-1 items-start">
              <div>{chatModel.name}</div>
              <div className="text-xs text-muted-foreground">
                {chatModel.description}
              </div>
            </div>

            {chatModel.id === selectedModel?.id && (
              <div className="text-foreground dark:text-foreground">
                <CheckCircleFillIcon />
              </div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
