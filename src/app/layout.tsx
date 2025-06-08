import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { NotificationProvider } from "@/providers/notification-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import ConditionalFloatingChat from "@/components/ui/conditional-floating-chat";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PXV Pay | Global Payments, Local Methods",
  description: "Empower your business with PXV Pay's modern, secure payment platform. Collect payments globally using local payment methods.",
  keywords: "payment processing, global payments, local payment methods, fintech, secure payments",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-foreground bg-background`}
      >
        <ThemeProvider defaultTheme="system" storageKey="pxv-theme">
          <NotificationProvider>
            {children}
            <ConditionalFloatingChat />
            <Toaster
              position="top-right"
              expand={true}
              richColors={true}
              closeButton={true}
              duration={4000}
              visibleToasts={5}
            />
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 