import "@/_css/globals.scss";
import { gothic } from "@/fonts";
import "./layout.scss";

export default function PrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${gothic.className}`}>
      <body className="screenContainer">
        <div className="printContainer">
          {children}
        </div>
      </body>
    </html>
  );
} 