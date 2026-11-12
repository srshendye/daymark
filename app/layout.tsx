
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daymark | Your day, in perspective",
  description: "A personal dashboard to plan, explore, and stay informed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
