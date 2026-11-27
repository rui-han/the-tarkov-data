import type { Metadata, Viewport } from "next";
import TopLevelLayout from "@/components/layout/TopLevelLayout";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description:
    "Ammunition stats, flea prices, tasks, hideout upgrades and crafts for Escape from Tarkov.",
  openGraph: { type: "website", siteName: SITE_NAME },
};

export const viewport: Viewport = {
  themeColor: "#1d1d1f",
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
          <TopLevelLayout>{children}</TopLevelLayout>
          <SpeedInsights />
        </body>
      </UserProvider>
    </html>
  );
}
