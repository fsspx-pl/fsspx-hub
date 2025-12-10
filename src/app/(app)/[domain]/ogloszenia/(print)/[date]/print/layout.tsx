import "./layout.scss";

export default function PrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="screenContainer">
      <div className="printContainer">
        {children}
      </div>
    </div>
  );
} 