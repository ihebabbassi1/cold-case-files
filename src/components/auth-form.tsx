"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crosshair } from "@/components/crosshair";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const { error } = await signUp.email({ name, email, password });
        if (error) {
          setError(error.message ?? "Could not create your badge.");
          setLoading(false);
          return;
        }
      } else {
        const { error } = await signIn.email({ email, password });
        if (error) {
          setError(error.message ?? "Those credentials were rejected.");
          setLoading(false);
          return;
        }
      }
      router.push("/cases");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="sheet mx-auto w-full max-w-md rounded-md border border-ink/40 p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <Crosshair className="mb-3 h-10 w-10 text-primary" />
        <h1 className="font-type text-lg uppercase tracking-[0.25em] text-ink">
          {isRegister ? "Issue Badge" : "Detective Sign-In"}
        </h1>
        <p className="mt-1 font-type text-xs uppercase tracking-wider text-muted-foreground">
          Classified — Authorized Personnel Only
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {isRegister && (
          <div className="space-y-1.5">
            <Label htmlFor="name" className="font-type text-xs uppercase tracking-wider">
              Detective name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="J. Doe"
              autoComplete="name"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="font-type text-xs uppercase tracking-wider">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="detective@precinct.gov"
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="font-type text-xs uppercase tracking-wider">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="At least 8 characters"
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
        </div>

        {error && (
          <p className="font-type text-xs uppercase tracking-wider text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full font-type uppercase tracking-widest">
          {loading
            ? "Working…"
            : isRegister
              ? "Create badge & enter"
              : "Enter the archive"}
        </Button>
      </form>

      <p className="mt-6 text-center font-type text-xs uppercase tracking-wider text-muted-foreground">
        {isRegister ? (
          <>
            Already have a badge?{" "}
            <Link href="/login" className="text-primary underline underline-offset-4">
              Sign in
            </Link>
          </>
        ) : (
          <>
            No badge yet?{" "}
            <Link href="/register" className="text-primary underline underline-offset-4">
              Request one
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
