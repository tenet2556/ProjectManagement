"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("TEAM_MEMBER");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Register:", { name, email, password, role });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* LEFT SIDE */}
          <div className="p-10 text-white relative">


            <h1 className="mt-12 text-4xl font-extrabold leading-tight">
              Create Your Account 
            </h1>

            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              Register and start organizing your projects, tasks, and team work.
            </p>


          </div>

          {/* RIGHT SIDE */}
          <div className="bg-white p-10 relative">


            <div className="mt-10">
              <h2 className="text-3xl font-bold text-gray-900">Register</h2>
              <p className="mt-2 text-gray-600">
                Fill in your details to create an account.
              </p>

              <form onSubmit={handleRegister} className="mt-8 space-y-5">
                {/* Name */}
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                {/* Email */}
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

                {/* Password */}
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                {/* Role Dropdown */}
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
                    <option value="MANAGER">Manager</option>
                    <option value="TEAM_MEMBER">Team Member</option>
                  </select>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold hover:opacity-90 transition"
                >
                  Create Account →
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
