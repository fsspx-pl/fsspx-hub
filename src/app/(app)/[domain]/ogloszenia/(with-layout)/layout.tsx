import { PageLayout } from "@/_components/PageLayout";

export default async function AnnouncementLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PageLayout>
      {children}
    </PageLayout>
  );
} 