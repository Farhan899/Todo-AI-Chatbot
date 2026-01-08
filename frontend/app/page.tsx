import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Todo App
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A secure multi-user todo application built with Next.js, FastAPI, and Better Auth.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signin"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 font-medium"
          >
            Sign Up
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Secure Authentication</h3>
            <p className="text-gray-600 text-sm">JWT-based authentication with user isolation</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Real-time Updates</h3>
            <p className="text-gray-600 text-sm">Instant task creation, updates, and deletion</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Responsive Design</h3>
            <p className="text-gray-600 text-sm">Works seamlessly on mobile and desktop</p>
          </div>
        </div>
      </div>
    </div>
  );
}
