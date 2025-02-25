"use client";

import { createAPI } from "@/lib/axios";
import { useEffect } from "react";
import { createContext, useContext, useState } from "react";

interface ChatContextType {
  jurisdictions: any[];
  legislation: any[];
  selectedJurisdiction: string;
  setSelectedJurisdiction: (jurisdiction: string) => void;
  selectedLegislation: string;
  setSelectedLegislation: (legislation: string) => void;
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
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("");
  const [selectedLegislation, setSelectedLegislation] = useState([]);

  //let's call the api's here as well
  useEffect(() => {
    async function fetchJurisdictions() {
      const API = await createAPI();
      const res = await API.get("chat/jurisdictions");
      console.log("jurisdictions", res.data);
      setJurisdictions(res.data);
    }

    async function fetchLegislation() {
      const API = await createAPI();
      const res = await API.get("chat/legislation_sources");
      console.log("legislation", res.data);
      setLegislation(res.data);
    }

    fetchJurisdictions();
    fetchLegislation();
  }, []);

  return (
    <ChatContext.Provider
      value={{
        jurisdictions,
        legislation,
        selectedJurisdiction,
        setSelectedJurisdiction,
        selectedLegislation,
        setSelectedLegislation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContextProvider;
