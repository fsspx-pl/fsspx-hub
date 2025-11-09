import { Footer } from "@/_components/Footer";
import { Header } from "@/_components/Header";
import "@/_css/globals.scss";
import { gothic } from "@/fonts";

export default function MinistranciLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${gothic.className}`}>
      <body>
        <Header></Header>
        {children}
        <Footer></Footer>
      </body>
    </html>
  );
}
