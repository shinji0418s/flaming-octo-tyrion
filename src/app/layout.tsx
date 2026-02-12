import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "積算管理システム",
  description: "積算代行業務のオペレーション管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased font-sans">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 bg-gray-50 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
