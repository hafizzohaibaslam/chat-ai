"use client";

import type { Attachment, Message, CreateMessage } from "ai";
import { useState, useEffect } from "react";
import { ChatHeader } from "@/components/chat-header";
import { generateUUID } from "@/lib/utils";
import { toast } from "sonner";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import { MultimodalInput } from "./multimodal-input";
import { Messages } from "./messages";

export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  isReadonly,
}: {
  id: string;
  initialMessages: Message[];
  selectedChatModel: string;
  isReadonly: boolean;
}) {
  // WebSocket Hook for real-time messages
  const { messages, sendMessage, isConnected, isLoading, error } =
    useChatWebSocket();

  // Local state for input and attachments
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  // Append messages to local state
  const appendMessage = async (message: Message | CreateMessage) => {
    if (!message.id) {
      message.id = generateUUID();
    }
    sendMessage(message.content, selectedChatModel);
  };

  // Handle message submission
  const handleSubmit = async (e?: { preventDefault?: () => void }) => {
    if (e?.preventDefault) e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: generateUUID(),
      role: "user",
      content: input,
    };

    appendMessage(userMessage);
    setInput(""); // Clear input field after sending
  };

  // Show toast notifications for WebSocket connection errors
  useEffect(() => {
    if (error) {
      toast.error(`WebSocket Error: ${error}`);
    }
  }, [error]);

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      {/* Chat Header */}
      <ChatHeader
        chatId={id}
        selectedModelId={selectedChatModel}
        isReadonly={isReadonly}
      />

      {/* Messages Container */}
      <Messages
        chatId={id}
        isLoading={isLoading}
        messages={messages}
        isReadonly={isReadonly}
      />

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl"
      >
        {!isReadonly && (
          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={() => {}}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={() => {}}
            append={appendMessage}
          />
        )}
      </form>
    </div>
  );
}
