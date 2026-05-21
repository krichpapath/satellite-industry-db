import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/shell";

export const metadata: Metadata = {
  title: "Thai Satellite Industry Database",
  description: "Data planner workbench for governed satellite industry records."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
