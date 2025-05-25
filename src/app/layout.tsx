import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { NotificationProvider } from "@/providers/notification-provider";
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
        <NotificationProvider>
          {children}
          <Toaster
            position="top-right"
            expand={true}
            richColors={true}
            closeButton={true}
            duration={4000}
            visibleToasts={5}
            toastOptions={{
              style: {
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
              },
              className: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
              descriptionClassName: 'group-[.toast]:text-muted-foreground'
            }}
          />
        </NotificationProvider>
      </body>
    </html>
  );
}
