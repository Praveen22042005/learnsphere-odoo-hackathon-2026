"use client";

import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

/**
 * Client-side only wrapper for Clerk's UserButton to prevent hydration errors.
 * This component delays rendering until after hydration is complete.
 */
export function ClientUserButton(
  props: React.ComponentProps<typeof UserButton>,
) {
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder that matches the expected structure during SSR
    return (
      <div className="shrink-0">
        <div className="w-4 h-4 rounded-full bg-muted" />
      </div>
    );
  }

  return <UserButton {...props} />;
}
