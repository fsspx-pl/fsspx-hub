import { Footer } from "@/_components/Footer";
import { Header } from "@/_components/Header";

export default function AnnouncementLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
} 