"use client";

import type { Attachment, Message, CreateMessage } from "ai";
import { useState } from "react";
import { ChatHeader } from "@/components/chat-header";
import { generateUUID } from "@/lib/utils";
import { toast } from "sonner";

import { MultimodalInput } from "./multimodal-input";
import { Messages } from "./messages";

export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedChatModel: string;
  isReadonly: boolean;
}) {
  // Local state for messages, input, and loading status
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  // Helper to append a new message to the chat
  const append = async (
    message: Message | CreateMessage,
    chatRequestOptions?: any
  ): Promise<string | null | undefined> => {
    if (!message.id) {
      message.id = generateUUID();
    }
    setMessages((prev) => [...prev, message as Message]);
    return Promise.resolve(null);
  };

  // Dummy submit handler: adds the user's message and simulates an assistant reply
  // Note: The event parameter is optional to avoid errors when called without one.
  const handleSubmit = async (
    e?: { preventDefault?: () => void },
    chatRequestOptions?: any
  ) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (!input.trim()) return;

    // Add the user's message
    const userMessage: Message = {
      id: generateUUID(),
      role: "user",
      content: input,
    };
    append(userMessage);
    setInput("");
    setIsLoading(true);

    // Simulate a delay for the assistant's response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: generateUUID(),
        role: "assistant",
        content: "This is a dummy assistant response.",
      };
      append(assistantMessage);
      setIsLoading(false);
    }, 1000);
  };

  // Dummy stop function (no operation)
  const stop = () => {
    // No operation in dummy mode
  };

  // Dummy reload function (resets to the initial messages)
  const reload = async () => {
    setMessages(initialMessages);
    return Promise.resolve(null);
  };

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          isLoading={isLoading}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          votes={[]}
          isArtifactVisible={false}
        />

        <form
          onSubmit={(e) => handleSubmit(e)}
          className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl"
        >
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          )}
        </form>
      </div>

      {/* <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      /> */}
    </>
  );
}
