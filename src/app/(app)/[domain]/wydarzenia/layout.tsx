import { Footer } from "@/_components/Footer";
import { Header } from "@/_components/Header";

export default function EventsLayout({
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

