import TopLevelLayout from "@/components/layout/TopLevelLayout";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ApolloWrapper } from "@/graphql/lib/apollo-wrapper";

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
        <ApolloWrapper>
          <TopLevelLayout children={children} />
          <SpeedInsights />
        </ApolloWrapper>
      </body>
    </html>
  );
}
