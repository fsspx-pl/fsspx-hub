import "@/_css/globals.scss";
import { gothic } from "@/fonts";
import { ThemeProvider } from "@/_components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${gothic.className}`} suppressHydrationWarning>
      <body className="bg-white dark:bg-[#2B2B2B] text-gray-900 dark:text-[#CCCCCC]">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
