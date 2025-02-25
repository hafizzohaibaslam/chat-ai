"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { signup } from "../action";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const response = await signup(formData);

      if (!response.success) {
        toast.error(response.error || "Signup failed. Please try again.");
      } else {
        toast.success("Signup successful! Redirecting...");
        setTimeout(() => {
          router.push("/chat");
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center">
      <div className="mb-[64px]">
        <Image src="/logo.svg" alt="Logo" width={136} height={60} priority />
      </div>
      <div className="w-full max-w-[360px] bg-background p-6 rounded-lg shadow-md">
        {/* Form Header */}
        <div className="space-y-3 mb-6">
          <h2 className="text-lg font-bold text-card-foreground">Sign Up</h2>
          <p className="text-sm text-muted-foreground">
            Let's get started. Fill in the details below to create your account.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              name="display_name"
              placeholder="Your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              required
            />
            <p className="text-sm text-muted-foreground">
              Minimum 8 characters.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="terms" name="terms" required />
            <label htmlFor="terms" className="text-sm text-foreground">
              I agree to the Terms & Conditions
            </label>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign up"}
          </Button>
        </form>

        <div className="flex justify-center items-center space-x-1 mt-4">
          <span className="text-sm text-muted-foreground">
            Already have an account?
          </span>
          <Link href="signin">
            <Button variant="link" className="text-sm text-primary p-0">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SignUpForm);
