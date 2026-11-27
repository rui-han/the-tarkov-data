import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ammunition",
  description:
    "Damage, penetration, armor damage and flea prices for every Escape from Tarkov round.",
};

export default function AmmunitionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
