import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* LEFT: Logo / Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-extrabold text-white">
            PTM
          </div>
          <span className="text-lg font-bold text-white tracking-wide">
            Project Tool
          </span>
        </Link>

        {/* RIGHT: Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2 rounded-xl text-white font-semibold hover:bg-white/10 transition"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="px-5 py-2 rounded-xl bg-white text-gray-900 font-bold hover:bg-gray-100 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
