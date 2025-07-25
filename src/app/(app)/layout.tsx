import "@/_css/globals.scss";
import { gothic } from "@/fonts";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${gothic.className}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
