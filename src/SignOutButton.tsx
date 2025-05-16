"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-4 py-2 rounded-lg transition-colors bg-blue-500 text-white"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}

Updated on 2025-05-16 10:30:49 - Change #1890

Updated on 2025-05-16 10:30:50 - Change #1557

Updated on 2025-05-16 10:30:53 - Change #6365

Updated on 2025-05-16 10:30:57 - Change #6353

Updated on 2025-05-16 10:31:01 - Change #4869
