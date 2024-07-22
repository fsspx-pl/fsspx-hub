import { Footer } from "@/_components/Footer";
import { Header } from "@/_components/Header";
import "@/_css/globals.scss";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${inter.className} bg-gray-100`}>
        <Header></Header>
        {children}
        <Footer></Footer>
      </body>
    </html>
  );
}
