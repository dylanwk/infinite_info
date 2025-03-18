import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { AuthProvider } from "@/components/providers/AuthContext";
const geistSans = localFont({
  src: "../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Infinite Info",
  description: "Test version of Infinite Info",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <link
          rel="icon"
          href="/images/iilogo.svg"
          type="image/svg+xml"
          sizes="48x48"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <AuthProvider>
            {children}
          </AuthProvider>
      </body>
    </html>
  );
}
