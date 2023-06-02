export const metadata = {
  title: "The Tarkov Data",
  description: "All the data and information you need for EFT.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
