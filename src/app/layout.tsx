import type { Metadata } from "next";
import BottomNav from "@/app/components/BottomNav"
import OfflineBanner from "@/app/components/OfflineBanner";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";  // ⬅️ import Toaster


// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "PT Mitra Toyotaka Indonesia",
  description: "PT Mitra Toyotaka Indonesia",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  icons: {
    icon: [
      { url: "/favicon.ico" }, 
      { url: "/android-icon-192x192.png", sizes: "192x192", type: "image/png" } 
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" } 
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
      </head>
          <body>
        <OfflineBanner />
        {children}
        <BottomNav />
         {/* 🔔 Toaster biar toast bisa muncul */}
         <Toaster position="top-right" reverseOrder={false} />
      </body>

     
    </html>
  );
}