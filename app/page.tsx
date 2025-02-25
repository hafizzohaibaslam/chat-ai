"use client";

import { redirect } from "next/navigation";
import React, { useEffect } from "react";

function Page() {
  useEffect(() => {
    redirect("/chat");
  }, []);

  return <div>page</div>;
}

export default Page;
