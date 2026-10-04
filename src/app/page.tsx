import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LandingPage from "@/components/LandingPage";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getSession();

  if (session?.userId) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}