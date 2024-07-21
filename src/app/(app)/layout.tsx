import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/_css/globals.scss";
import { Footer } from "@/_components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FSSPX",
  description: "Bractwo Św. Piusa X",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${inter.className} bg-gray-100`}>
        {children}
        <Footer></Footer>
      </body>
    </html>
  );
}
