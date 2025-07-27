import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solid App Launcher",
  description: "Discover and launch applications in the Solid ecosystem",
  keywords: ["Solid", "Web3", "Decentralized", "Apps", "Launcher"],
  authors: [{ name: "Solid Project" }],
  openGraph: {
    title: "Solid App Launcher",
    description: "Discover and launch applications in the Solid ecosystem",
    url: "https://start.solidproject.org",
    siteName: "Solid App Launcher",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solid App Launcher",
    description: "Discover and launch applications in the Solid ecosystem",
  },
  icons: {
    icon: "/solid-icon.svg",
    apple: "/solid-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
