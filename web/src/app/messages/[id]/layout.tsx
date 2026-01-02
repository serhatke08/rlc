export default function MessagesChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Bu layout sadece children'ı render eder
  // LayoutWrapper içinde pathname kontrolü yapılıyor
  return <>{children}</>;
}
