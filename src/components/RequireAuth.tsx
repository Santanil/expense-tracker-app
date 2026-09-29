"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login");
    }
  }, [loading, session, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-ink/60 font-body text-sm">
        Loading…
      </div>
    );
  }

  if (!session) {
    // Redirect is in flight — render nothing to avoid a flash of protected content.
    return null;
  }

  return <>{children}</>;
}
