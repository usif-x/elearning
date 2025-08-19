"use client";

import Hero from "@/components/server/Hero";
import OurFeatures from "@/components/server/OurFuture";
import CTASection from "@/components/server/SuggestRegister";
import { useAuthStore } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    // Optionally render nothing while redirecting
    return null;
  }

  return (
    <>
      <Hero />
      <OurFeatures />
      <CTASection />
    </>
  );
}
