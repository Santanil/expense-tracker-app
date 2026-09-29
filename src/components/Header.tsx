"use client";

import { useAuth } from "@/lib/auth-context";

export default function Header({ title }: { title: string }) {
  const { signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper px-5 py-4">
      <div className="mx-auto flex max-w-md items-center justify-between md:max-w-2xl lg:max-w-4xl">
        <h1 className="font-display text-xl text-ink">{title}</h1>
        <button
          onClick={() => signOut()}
          className="font-body text-sm text-ink/60 underline decoration-line underline-offset-4 transition hover:text-rust"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
