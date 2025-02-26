"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Message } from "ai";
import { getAccessTokenClient } from "@/utils/supabase/token";
import { useChatContext } from "@/context/chatContext";
import { API } from "@/lib/axios";

const BASE_WEBSOCKET_URL =
  "wss://law-captain-backend.onrender.com/api/v1/chat/ws/chat";
const LONG_CONTEXT_API_URL = "chat/long_context_chat";

// Function to calculate total word count in messages
const getTotalWordCount = (messages: Message[]) => {
  return messages.reduce(
    (acc, msg) => acc + msg.content.split(/\s+/).length,
    0
  );
};

export function useChatWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savedModelId = localStorage.getItem("selectedModelId");

  const {
    selectedLegislation,
    selectedJurisdiction,
    fileUploadResponse,
    emptyFileUploadResponse,
  } = useChatContext();

  let legislationUrls: string[] = [];
  if (selectedLegislation) {
    legislationUrls = selectedLegislation.map(
      (item: { value: string }) => item.value
    );
  }

  // WebSocket Connection
  useEffect(() => {
    async function connectWebSocket() {
      try {
        const token = await getAccessTokenClient();
        if (!token) throw new Error("No access token available.");

        const wsUrl = `${BASE_WEBSOCKET_URL}?token=${encodeURIComponent(
          token
        )}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          console.log("✅ Connected to WebSocket");
          setIsConnected(true);
          setError(null);
        };

        ws.current.onmessage = (event) => {
          const response = JSON.parse(event.data);
          console.log("WS onmessage response:", response);

          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];

            switch (response.type) {
              case "chunk":
                if (lastMessage?.role === "assistant") {
                  return [
                    ...prev.slice(0, -1),
                    {
                      ...lastMessage,
                      content: lastMessage.content + response.content,
                    },
                  ];
                } else {
                  return [
                    ...prev,
                    {
                      id: crypto.randomUUID(),
                      role: "assistant",
                      content: response.content,
                    },
                  ];
                }

              case "done":
                setIsLoading(false);
                return prev;

              case "error":
                console.error("❌ WS Error:", response.error);
                setError(response.error);
                setIsLoading(false);
                return prev;

              default:
                return prev;
            }
          });
        };

        ws.current.onclose = () => {
          console.log("🔴 WebSocket connection closed.");
          setIsConnected(false);
        };

        ws.current.onerror = (event) => {
          console.error("❌ WebSocket error:", event);
          setError("WebSocket error occurred.");
          setIsConnected(false);
        };
      } catch (error: any) {
        console.error("❌ Failed to connect WebSocket:", error);
        setError(error.message);
      }
    }

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Send a new message
  const sendMessage = useCallback(
    async (message: string, modelType: string = "balanced") => {
      if (!["fast", "balanced", "premium_thinking"].includes(modelType)) {
        console.error("Invalid model type:", modelType);
        modelType = "balanced";
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: message,
      };
      setMessages((prev) => [...prev, userMessage]);

      // Check if total word count exceeds 150,000
      const totalWordCount = getTotalWordCount([...messages, userMessage]);

      console.log("Total Word Count:", totalWordCount);

      if (totalWordCount > 150000) {
        console.warn("⚠️ Context too large! Switching to long context API...");

        // Switch to Long Context API
        try {
          setIsLoading(true);
          const response = await API.post(LONG_CONTEXT_API_URL, {
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            model_type: savedModelId || modelType,
            search_database: true,
            legislation_urls: legislationUrls,
            jurisdiction_ids: selectedJurisdiction, // Ensure array
            file_contents: fileUploadResponse,
          });

          console.log("✅ Long Context API Response:", response.data);

          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: response.data.response.content,
            },
          ]);
          setIsLoading(false);
          emptyFileUploadResponse();
        } catch (error) {
          console.error("❌ Long Context API Error:", error);
          setError("Failed to process request with Long Context API.");
          setIsLoading(false);
        }
      } else {
        // Use WebSocket for normal-sized requests
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          const request = {
            messages: [{ role: "user", content: message }],
            model_type: savedModelId || modelType,
            search_database: true,
            selected_legislation: legislationUrls,
            selected_jurisdiction: selectedJurisdiction,
            file_contents: fileUploadResponse,
          };

          console.log("Sending request to WebSocket:", request);
          ws.current.send(JSON.stringify(request));
          setIsLoading(true);
          emptyFileUploadResponse();
        } else {
          console.error("WebSocket is not connected.");
          setError("WebSocket is not connected.");
        }
      }
    },
    [messages, legislationUrls, selectedJurisdiction, savedModelId]
  );

  return { messages, sendMessage, isConnected, isLoading, error };
}
