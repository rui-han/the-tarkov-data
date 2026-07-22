import { Metadata } from "next";
import TopLevelLayout from "@/components/layout/TopLevelLayout";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ApolloWrapper } from "@/graphql/lib/apollo-wrapper";
import { UserProvider } from "@auth0/nextjs-auth0/client";

export const metadata: Metadata = {
  title: "The Tarkov Data",
  description: "All the data and information you need for EFT.",
};

// Force every route under this layout to render dynamically (per request)
// instead of being statically generated at build time. Nearly every page
// depends on live data from the Tarkov.dev GraphQL API (via the nav bar's
// ServerStatus component alone), so a transient outage/503 from that API
// during `next build` would otherwise fail the entire deployment.
export const dynamic = "force-dynamic";

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
