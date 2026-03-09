"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "register",
          name,
          email,
          password,
          role,
          // Backend requires employee fields; we default them to user fields
          employeeEmail: email,
          employeeName: name,
          employeeRole: role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Registration failed");
        setSubmitting(false);
        return;
      }

      // Cookie is set server-side; redirect to dashboard
      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Network error");
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
              Create an account
            </h1>
            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              Set up your account to start organizing projects and tasks.
            </p>
          </div>

          {/* RIGHT */}
          <div className="bg-white p-10 relative">
            <div className="absolute top-6 right-6">
              <Link
                href="/login"
                className="text-sm font-semibold text-purple-600 hover:underline"
              >
                Already registered? Login →
              </Link>
            </div>

            <div className="mt-10">
              <h2 className="text-3xl font-bold text-gray-900">
                Register
              </h2>

              <form onSubmit={handleRegister} className="mt-8 space-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Name</label>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <input
                    type="password"
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-2 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="TEAM_LEADER">Team Leader</option>
                    <option value="MEMBER">Team Member</option>
                  </select>
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
                  {submitting ? "Creating..." : "Create Account →"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
