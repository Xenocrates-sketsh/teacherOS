export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Teacher Workspace</h1>
      <p className="text-gray-600 mb-8">A premium educational platform</p>
      <div className="flex gap-4">
        <a href="/login" className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700">
          Login
        </a>
        <a href="/register" className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
          Register
        </a>
      </div>
    </main>
  );
}
