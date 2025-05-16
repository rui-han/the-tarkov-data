import { Metadata } from "next";
import TopLevelLayout from "@/components/layout/TopLevelLayout";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ApolloWrapper } from "@/graphql/lib/apollo-wrapper";
import { UserProvider } from "@auth0/nextjs-auth0/client";

export const metadata: Metadata = {
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
      <UserProvider>
        <body>
          <ApolloWrapper>
            <TopLevelLayout children={children} />
            <SpeedInsights />
          </ApolloWrapper>
        </body>
      </UserProvider>
    </html>
  );
}
