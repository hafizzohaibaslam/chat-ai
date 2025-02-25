"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Message } from "ai";
import { getAccessTokenClient } from "@/utils/supabase/token";
import { useChatContext } from "@/context/chatContext";

const BASE_WEBSOCKET_URL =
  "wss://law-captain-backend.onrender.com/api/v1/chat/ws/chat";

export function useChatWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Grab your model ID from localStorage (if any)
  const savedModelId = localStorage.getItem("selectedModelId");

  // Grab selectedLegislation, selectedJurisdiction from context
  const { selectedLegislation, selectedJurisdiction } = useChatContext();

  // Convert selectedLegislation array to a list of URLs
  let legislationUrls: string[] = [];
  if (selectedLegislation) {
    legislationUrls = selectedLegislation.map(
      (item: { value: string }) => item.value
    );
  }

  // Establish WebSocket connection once
  useEffect(() => {
    async function connectWebSocket() {
      try {
        const token = await getAccessTokenClient();
        if (!token) throw new Error("No access token available.");

        // Build WS URL with token
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

          // Show the server's response in console for debugging
          console.log("WS onmessage response:", response);

          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];

            switch (response.type) {
              case "chunk":
                // If last message is from the assistant, append
                if (lastMessage?.role === "assistant") {
                  return [
                    ...prev.slice(0, -1),
                    {
                      ...lastMessage,
                      content: lastMessage.content + response.content,
                    },
                  ];
                } else {
                  // Otherwise, create a new assistant message
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

              case "warning":
                console.warn("⚠️ WS Warning:", response.content);
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
    (message: string, modelType: string = "balanced") => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        if (!["fast", "balanced", "premium_thinking"].includes(modelType)) {
          console.error("Invalid model type:", modelType);
          modelType = "balanced";
        }

        // Add the user message to local state
        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: "user",
          content: message,
        };
        setMessages((prev) => [...prev, userMessage]);

        // Prepare the request
        const request = {
          messages: [{ role: "user", content: message }],
          model_type: savedModelId || modelType,
          search_database: true,
          selected_legislation: legislationUrls, // array of strings (URLs)
          selected_jurisdiction: selectedJurisdiction, // single ID or array?
        };

        // Log the request so you can see what's being sent over WS
        console.log("Sending request to WebSocket:", request);

        // Send the request
        ws.current.send(JSON.stringify(request));
        setIsLoading(true);
      } else {
        console.error("WebSocket is not connected.");
        setError("WebSocket is not connected.");
      }
    },
    [legislationUrls, selectedJurisdiction, savedModelId]
  );

  return { messages, sendMessage, isConnected, isLoading, error };
}
