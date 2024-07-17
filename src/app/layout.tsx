import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | AltSchoolAfrica Invoice Manager ",
    default: "AltSchoolAfrica Invoice Manager",
  },
  description:
    "An invoice manager for the nextjs generation of badass software engineers",
  metadataBase: new URL("http://locahost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-white">
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  );
}
