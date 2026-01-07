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
      <body className="bg-[var(--bg-primary)] dark:bg-[var(--bg-primary)] text-[var(--text-primary)] dark:text-[var(--text-primary)]">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
