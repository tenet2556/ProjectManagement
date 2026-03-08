"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {

  const [adminEmail, setAdminEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("MEMBER");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "register",
          adminEmail,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();

      alert(data.message);

    } catch (error) {
      console.error(error);
      alert("Registration failed");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">

        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* LEFT SIDE */}
          <div className="p-10 text-white relative">

            <h1 className="mt-12 text-4xl font-extrabold leading-tight">
              Admin Register User
            </h1>

            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              Only administrators can create new accounts for employees.
            </p>

          </div>

          {/* RIGHT SIDE */}
          <div className="bg-white p-10 relative">

            <div className="mt-10">
              <h2 className="text-3xl font-bold text-gray-900">
                Create Employee Account
              </h2>

              <p className="mt-2 text-gray-600">
                Admin must enter their email to authorize registration.
              </p>

              <form onSubmit={handleRegister} className="mt-8 space-y-5">

                {/* Admin Email */}
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    placeholder="admin@mail.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="mt-2 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                {/* User Email */}
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Employee Email
                  </label>
                  <input
                    type="email"
                    placeholder="employee@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-2 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="TEAM_MEMBER">Team Member</option>
                    <option value="TEAM_LEADER">Team Leader</option>
                    <option value="PROJECT_MANAGER">Project Manager</option>
                  </select>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold hover:opacity-90 transition"
                >
                  Create User →
                </button>

              </form>

              <p className="mt-8 text-center text-gray-600">
                Already registered?{" "}
                <Link
                  href="/login"
                  className="text-purple-600 font-semibold hover:underline"
                >
                  Login
                </Link>
              </p>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}