import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="text-center block">
            <h1 className="text-3xl font-bold text-gold-400">
              Teacher Workspace
            </h1>
          </Link>
          <p className="mt-2 text-center text-sm text-[#9d8ab5]">
            A premium educational platform for teachers and students
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
