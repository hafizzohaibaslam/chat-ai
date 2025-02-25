"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

async function handleAuthAction(
  formData: FormData,
  authType: "login" | "signup"
) {
  console.log(`Starting ${authType} process.`);

  // Extract inputs
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  console.log(`Email: ${email}`);
  console.log(`Password length: ${password ? password.length : 0}`);

  // Create Supabase client
  const supabase = await createClient();
  console.log("Supabase client created.");

  let result;
  if (authType === "login") {
    console.log("Attempting sign in...");
    result = await supabase.auth.signInWithPassword({ email, password });
  } else {
    console.log("Attempting sign up...");
    // Extract display_name and pass as metadata
    const displayName = formData.get("display_name") as string;
    console.log(`Display Name: ${displayName}`);
    result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
  }

  console.log(`Response from Supabase for ${authType}:`, {
    user: result.data?.user,
    session: result.data?.session,
    error: result.error,
  });

  if (result.error) {
    console.error(`${authType} error:`, result.error.message);
    return { success: false, error: result.error.message };
  }

  console.log("Revalidating path and redirecting to /chat.");
  revalidatePath("/", "layout");

  return {
    success: true,
    user: result.data.user,
    session: result.data.session,
  };
}

export async function login(formData: FormData) {
  return handleAuthAction(formData, "login");
}

export async function signup(formData: FormData) {
  return handleAuthAction(formData, "signup");
}

export async function signOut() {
  const supabase = await createClient();

  // Check if a user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    console.log("Signing out user:", user.email);
    await supabase.auth.signOut();
  } else {
    console.log("No user to sign out.");
  }

  return { success: true };
}
