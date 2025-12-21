// src/components/AuthButton.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthButtonProps {
  isOpen?: boolean;
}

export default function AuthButton({ isOpen = true }: AuthButtonProps) {
  const { data: session, status } = useSession();

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center gap-4 p-2 h-[48px]">
        <div className="w-8 h-8 rounded-full bg-[var(--zinc-800)] animate-pulse" />
        {isOpen && (
          <div className="h-4 w-24 bg-[var(--zinc-800)] rounded animate-pulse" />
        )}
      </div>
    );
  }

  // Signed in state
  if (session?.user) {
    return (
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-black font-medium">
                {session.user.name?.charAt(0) || "U"}
              </div>
            )}
            {/* Sync status indicator will be added later */}
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 ring-2 ring-[var(--background)]" />
          </div>
          {isOpen && (
            <span className="text-sm font-medium truncate text-[var(--zinc-300)]">
              {session.user.name}
            </span>
          )}
        </div>
        {isOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            className="hover:bg-[var(--zinc-800)] hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  // Signed out state
  return (
    <Button
      variant="ghost"
      onClick={() => signIn("google")}
      className={`w-full flex items-center gap-3 p-2 text-[var(--zinc-400)] hover:text-white hover:bg-[var(--zinc-800)] transition-all duration-200 ${
        isOpen ? "justify-start" : "justify-center"
      }`}
    >
      <LogIn className="w-5 h-5" />
      {isOpen && <span className="font-semibold">Sign In with Google</span>}
    </Button>
  );
}
