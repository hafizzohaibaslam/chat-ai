"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { login } from "../action";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    []
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
    []
  );

  const handleRememberMeChange = useCallback((checked: boolean) => {
    setRememberMe(checked);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await login(formData);

      // Assuming `login` function throws an error on failure, or returns an error message.
      if (response?.error) {
        toast.error(response.error);
      } else {
        toast.success("Login successful!");
        // Redirect to dashboard
        router.push("/chat");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center">
      <div className="mb-[64px]">
        <Image src="/logo.svg" alt="Logo" width={136} height={60} priority />
      </div>

      <Card className="w-[313px] p-6 space-y-4 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.06),0_4px_6px_-1px_rgba(0,0,0,0.1)]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-lg font-bold text-foreground">Sign in</h1>

          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            required
          />

          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            required
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={handleRememberMeChange}
            />
            <label htmlFor="remember" className="text-sm text-foreground">
              Remember me
            </label>
          </div>

          <Button
            className="w-full bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <button
            type="button"
            className="w-full text-sm text-muted-foreground"
          >
            Forgot password?
          </button>
        </form>

        <Separator />

        <div className="flex justify-center items-center space-x-1 mt-4">
          <span className="text-sm text-muted-foreground">
            Don&apos;t have an account?
          </span>
          <Link href="signup">
            <Button variant="link" className="text-sm text-primary p-0">
              Sign up
            </Button>
          </Link>
        </div>
      </Card>
      <Toaster />
    </div>
  );
};

export default React.memo(LogIn);
