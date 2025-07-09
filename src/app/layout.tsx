import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { NotificationProvider } from "@/providers/notification-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import ConditionalFloatingChat from "@/components/ui/conditional-floating-chat";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "PXV Pay | Beyond Boundaries",
  description: "Empower your business with PXV Pay's customizable payment platform. Accept payments worldwide with transparent pricing and complete control.",
  keywords: "payment platform, business payments, fintech, secure payments, payment links",
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
        className={`${geist.variable} ${geistMono.variable} ${inter.variable} antialiased text-foreground bg-background font-sans`}
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