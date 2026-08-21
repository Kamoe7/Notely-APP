"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

function deriveTitle(body) {
  const oneLine = body.trim().split("\n")[0];
  return oneLine.length > 60 ? oneLine.slice(0, 57) + "…" : oneLine;
}

export default function FeedbackWidget({ userId }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || status === "sending") return;
    setStatus("sending");

    // Matches the frozen tickets/{id} schema in the Person A work doc.
    // triage{} and run{} are written later, by Person B's agents — we
    // don't set them here.
    await addDoc(collection(db, "tickets"), {
      title: deriveTitle(text),
      body: text.trim(),
      userId,
      createdAt: serverTimestamp(),
      status: "NEW",
    });

    setStatus("sent");
    setText("");
    setTimeout(() => {
      setStatus("idle");
      setOpen(false);
    }, 1800);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 rounded-xl border border-line bg-white p-5 shadow-lg">
          {status === "sent" ? (
            <p className="font-mono text-sm text-ledger">
              Thanks — we've got it.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="mb-2 font-display text-lg italic text-ink">
                What's missing or broken?
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder="e.g. I really need dark mode"
                className="w-full resize-none rounded-lg border border-line px-3 py-2 font-body text-sm text-ink placeholder:text-ink/35 focus:border-ledger"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 font-mono text-xs text-ink/50 hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="rounded-lg bg-ledger px-4 py-2 font-mono text-xs uppercase tracking-wide text-paper hover:bg-ledger2 disabled:opacity-50"
                >
                  {status === "sending" ? "Sending…" : "Send"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Give feedback"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-paper shadow-lg transition hover:bg-ink/85"
      >
        <span className="font-display text-xl italic">?</span>
      </button>
    </div>
  );
}
