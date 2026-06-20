import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StudentProvider } from "@/lib/student-context";

export const metadata: Metadata = {
  title: "TAP Buddy",
  description: "Your daily learning companion",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StudentProvider>
          <div className="max-w-md lg:max-w-none mx-auto lg:mx-0 min-h-screen relative" style={{ background: "var(--bg)" }}>
            {children}
          </div>
        </StudentProvider>
      </body>
    </html>
  );
}