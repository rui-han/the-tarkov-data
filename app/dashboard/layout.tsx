import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your watchlist and favorite ammo.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
