import { Footer } from "@/_components/Footer";
import { Header } from "@/_components/Header";
import "@/_css/globals.scss";
import { gothic  } from "@/fonts"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${gothic.className}`}>
        <Header></Header>
        {children}
        <Footer></Footer>
      </body>
    </html>
  );
}
