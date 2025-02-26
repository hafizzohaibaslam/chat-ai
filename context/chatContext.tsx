"use client";

import { API } from "@/lib/axios";
import { useEffect } from "react";
import { createContext, useContext, useState } from "react";

interface ChatContextType {
  jurisdictions: any[];
  legislation: any[];
  selectedJurisdiction: string[];
  setSelectedJurisdiction: (jurisdiction: string[]) => void;
  selectedLegislation: string[];
  setSelectedLegislation: (legislation: string[]) => void;
  fileUploadResponse: string[];
  emptyFileUploadResponse: () => void;
  addFileUploadResponse: (response: string[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatContextProvider");
  }
  return context;
};

export const ChatContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [jurisdictions, setJurisdictions] = useState([]);
  const [legislation, setLegislation] = useState([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string[]>(
    []
  );
  const [selectedLegislation, setSelectedLegislation] = useState<string[]>([]);
  const [fileUploadResponse, setFileUploadResponse] = useState<string[]>([]);

  //let's call the api's here as well
  useEffect(() => {
    async function fetchJurisdictions() {
      const res = await API.get("chat/jurisdictions");
      console.log("jurisdictions", res.data);
      setJurisdictions(res.data);
    }

    async function fetchLegislation() {
      const res = await API.get("chat/legislation_sources");
      console.log("legislation", res.data);
      setLegislation(res.data);
    }

    fetchJurisdictions();
    fetchLegislation();
  }, []);

  const addFileUploadResponse = (response: string[]) => {
    setFileUploadResponse((prev) => [...prev, ...response]);
  };
  const emptyFileUploadResponse = () => {
    setFileUploadResponse([]);
  };

  return (
    <ChatContext.Provider
      value={{
        jurisdictions,
        legislation,
        selectedJurisdiction,
        setSelectedJurisdiction,
        selectedLegislation,
        setSelectedLegislation,
        fileUploadResponse,
        emptyFileUploadResponse,
        addFileUploadResponse,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContextProvider;
