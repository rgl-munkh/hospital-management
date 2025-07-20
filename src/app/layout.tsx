import type { Metadata } from "next";
import { manrope } from "@/lib/fonts";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Orthotics Management System",
  description: "Orthotics Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
