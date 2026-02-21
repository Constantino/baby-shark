import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Web3Provider } from "@/components/providers/Web3Provider";
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
  title: "Baby Shark Agent",
  description: "Your fearless on chain swap sniper that hunts profit while you sleep.",
  icons: {
    icon: { url: "/BabySharkIcon.png?v=1", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="base:app_id" content="6999b80c49d3b2f3d407e8f6" />
        <link
          rel="icon"
          href="/BabySharkIcon.png?v=1"
          type="image/png"
          sizes="32x32"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Provider>
          <Navbar />
          <main className="px-4 py-6">{children}</main>
        </Web3Provider>
      </body>
    </html>
  );
}
