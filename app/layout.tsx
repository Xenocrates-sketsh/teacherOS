import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StarField from "@/lib/components/StarField";
import ThemeInit from "@/lib/components/ThemeInit";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Teacher Workspace",
  description: "A premium educational platform for teachers and students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-surface text-[#f8f4ff]`}>
        <StarField />
        <ThemeInit />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
