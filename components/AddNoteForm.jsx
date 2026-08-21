"use client";

import { useState } from "react";

export default function AddNoteForm({ onAdd }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    await onAdd(text);
    setText("");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a note…"
        className="flex-1 rounded-lg border border-line bg-white px-4 py-3 font-body text-sm text-ink placeholder:text-ink/35 focus:border-ledger"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-ledger px-5 py-3 font-mono text-xs uppercase tracking-wide text-paper transition hover:bg-ledger2 disabled:opacity-50"
      >
        Add
      </button>
    </form>
  );
}
