import TopLevelLayout from "@/components/layout/TopLevelLayout";

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
      <body>
        <TopLevelLayout children={children} />
      </body>
    </html>
  );
}
