// AppSidebar.server.tsx
import React from "react";
import { createClient } from "@/utils/supabase/server";
import SidebarClient from "./SidebarClient";

export default async function AppSidebar(): Promise<JSX.Element> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Pass the fetched user (or null) to the client component.
  return <SidebarClient user={user} />;
}
