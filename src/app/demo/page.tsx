import React from "react";
import type { Metadata } from "next";
import DemoView from "@/components/DemoView";

export const metadata: Metadata = {
  title: "Interactive System Architecture & Live UI Demo | THE WARDEN",
  description:
    "Experience The Warden's sovereign command center. Test interactive discipline cards, impulse vaults, and streak telemetry before initializing your node.",
  alternates: {
    canonical: "/demo",
  },
};

export default function DemoPage() {
  return <DemoView />;
}
