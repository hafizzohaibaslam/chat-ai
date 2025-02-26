"use client";

import { startTransition, useEffect, useState } from "react";

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
import { API } from "@/lib/axios";

export function ModelSelector({
  selectedModelId,
  className,
}: {
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [chatModels, setChatModels] = useState<ChatModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<ChatModel | null>(null);

  console.log("selectedModel", selectedModel);

  // Fetch models on mount
  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await API.get<{ models: ChatModel[] }>(
          "chat/available_models"
        );

        setChatModels(res.data.models);

        const savedModelId = localStorage.getItem("selectedModelId");

        const initialModel =
          res.data.models.find(
            (model) => model.id === (savedModelId || selectedModelId)
          ) ||
          res.data.models[1] || // Default to second model if available
          res.data.models[0]; // Otherwise, default to the first model

        setSelectedModel(initialModel);
      } catch (error) {
        console.error("Error fetching chat models:", error);
      }
    }

    fetchModels();
  }, [selectedModelId]);

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
                setSelectedModel(chatModel);
                localStorage.setItem("selectedModelId", chatModel.id);
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
