import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 flex items-center justify-center px-4 py-10">
      {/* Outer Card */}
      <div className="w-full max-w-5xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* LEFT SIDE - Info Panel */}
          <div className="p-10 text-white relative">



            {/* Main Heading */}
            <h1 className="mt-12 text-4xl font-extrabold leading-tight">
              Welcome to your <br /> Project Workspace
            </h1>

            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              A collaborative Project & Task Management Tool that helps teams
              create projects, assign tasks, track progress using Kanban boards,
              and monitor performance in one place.
            </p>

          </div>

          {/* RIGHT SIDE - Action Panel */}
          <div className="bg-white p-10 relative">
            {/* Top Right Buttons */}
            

            {/* Center Content */}
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-gray-900">Get Started</h2>

              <p className="mt-3 text-gray-600 leading-relaxed">
                Login if you already have an account, or register to create a new
                account and start managing your team’s work.
              </p>

              {/* Big CTA Buttons */}
              <div className="mt-10 space-y-4">
                <Link
                  href="/login"
                  className="block w-full text-center px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold hover:opacity-90 transition"
                >
                  Continue to Login →
                </Link>

                <Link
                  href="/register"
                  className="block w-full text-center px-6 py-4 rounded-2xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition"
                >
                  Create New Account
                </Link>
              </div>

              {/* Small Note */}

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
