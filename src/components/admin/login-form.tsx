"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("admin@sayarty.local");
  const [password, setPassword] = useState("ChangeMe123!");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Login failed.");
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2 text-sm">
        <span>Email</span>
        <input
          className="h-12 w-full rounded-2xl border border-white/10 px-4"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className="block space-y-2 text-sm">
        <span>Password</span>
        <input
          type="password"
          className="h-12 w-full rounded-2xl border border-white/10 px-4"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-full bg-[#C9A07F] font-medium text-[#080A0B]"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
