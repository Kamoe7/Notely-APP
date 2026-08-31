"use client";

import { useState } from "react";
import { setDisplayName } from "@/lib/identity";

export default function NameGate({ onDone }) {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setDisplayName(name);
    onDone(name.trim());
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-line bg-white p-8 dark:border-gray-700 dark:bg-gray-800"
      >
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ledger">
          Notely
        </p>
        <h1 className="mt-1 font-display text-2xl italic text-ink dark:text-white">
          What should we call you?
        </h1>
        <p className="mt-2 text-sm text-ink/60 dark:text-gray-400">
          No password — just a name, so your notes stay yours.
        </p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="mt-5 w-full rounded-lg border border-line px-4 py-3 font-body text-sm text-ink placeholder:text-ink/35 focus:border-ledger dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-ledger px-4 py-3 font-mono text-xs uppercase tracking-wide text-paper transition hover:bg-ledger2"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
