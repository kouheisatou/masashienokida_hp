import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import "./admin.css"; // Import admin-specific styles (mainly tailwind directives if needed, or just reset)

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard | Masashi Enokida",
  description: "Management console",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-gray-100 text-gray-900 antialiased`}>
        <div className="flex min-h-screen">
          <AdminSidebar />
          <div className="flex-1 flex flex-col ml-64">
            <AdminHeader />
            <main className="flex-1 p-8 mt-16 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
