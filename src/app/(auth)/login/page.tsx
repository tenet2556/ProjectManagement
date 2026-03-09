"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "login",
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Login failed. Please try again.");
        return;
      }

      // Cookie set by server, redirect
      router.replace(next);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* LEFT */}
          <div className="p-10 text-white">
            <h1 className="mt-12 text-4xl font-extrabold leading-tight">
              Welcome Back 👋
            </h1>
            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              Login to continue managing your projects, tasks, and Kanban boards.
            </p>
          </div>

          {/* RIGHT */}
          <div className="bg-white p-10 relative">
            <div className="absolute top-6 right-6">
              <Link
                href="/register"
                className="text-sm font-semibold text-purple-600 hover:underline"
              >
                New here? Register →
              </Link>
            </div>

            <div className="mt-10">
              <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
              <p className="mt-2 text-gray-600">
                Enter your email and password to continue.
              </p>

              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Logging in..." : "Login →"}
                </button>
              </form>

              <p className="mt-8 text-center text-gray-600">
                Don’t have an account?{" "}
                <Link
                  href="/register"
                  className="text-purple-600 font-semibold hover:underline"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}