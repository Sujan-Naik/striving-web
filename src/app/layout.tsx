import type { Metadata } from "next";
import { Pixelify_Sans } from "next/font/google";
import "@/styles/globals.css";
import {SessionProvider} from "next-auth/react";

const pixelifySans = Pixelify_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Striving",
  description: "A Comprehensive Work Companion Web App for Software Engineers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pixelifySans.className} antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}