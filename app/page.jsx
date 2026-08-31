"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getDisplayName } from "@/lib/identity";
import NoteCard from "@/components/NoteCard";
import AddNoteForm from "@/components/AddNoteForm";
import FeedbackWidget from "@/components/FeedbackWidget";
import ShipNotifications from "@/components/ShipNotifications";
import NameGate from "@/components/NameGate";

export default function Home() {
  const [userId, setUserId] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportError, setExportError] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme ? savedTheme === "dark" : prefersDark;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  function toggleDarkMode() {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  }

  useEffect(() => {
    setUserId(getDisplayName());
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, "notes"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setNotes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  async function handleAdd(text) {
    if (!text.trim()) return;
    await addDoc(collection(db, "notes"), {
      text: text.trim(),
      author: userId,
      createdAt: serverTimestamp(),
    });
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, "notes", id));
  }

  // Deliberately broken on purpose — this is a demo bug for TicketPilot to fix live.
  function handleExport() {
    setExportError(true);
    setTimeout(() => setExportError(false), 3000);
  }

  if (checkingAuth) return null;
  if (!userId) return <NameGate onDone={setUserId} />;

  return (
    <main className="min-h-screen transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      <header className="border-b border-line px-6 py-8 sm:px-10 dark:border-zinc-800">
        <div className="mx-auto flex max-w-3xl items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ledger dark:text-zinc-400">
              Notely
            </p>
            <h1 className="mt-1 font-display text-3xl italic text-ink sm:text-4xl dark:text-zinc-100">
              Quick notes, kept in order.
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="flex items-center gap-1.5 rounded-full border border-line px-3 py-2 font-mono text-xs uppercase tracking-wide text-ink/70 transition hover:border-ink/40 hover:text-ink dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
            >
              {darkMode ? (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Light</span>
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span>Dark</span>
                </>
              )}
            </button>
            <button
              onClick={handleExport}
              className="rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-ink/70 transition hover:border-ink/40 hover:text-ink dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
            >
              Export
            </button>
          </div>
        </div>
        {exportError && (
          <div className="mx-auto mt-4 max-w-3xl rounded-md border border-flag/30 bg-flag/10 px-4 py-2 font-mono text-xs text-flag">
            Export failed. Nothing was downloaded. Try again later.
          </div>
        )}
      </header>

      <ShipNotifications userId={userId} />

      <section className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <AddNoteForm onAdd={handleAdd} />

        <ol className="mt-10 space-y-3">
          {loading && (
            <p className="font-mono text-sm text-ink/40 dark:text-zinc-500">Loading notes…</p>
          )}
          {!loading && notes.length === 0 && (
            <li className="rounded-lg border border-dashed border-line px-5 py-8 text-center font-body text-sm text-ink/50 dark:border-zinc-800 dark:text-zinc-400">
              No notes yet. Write down the first thing on your mind.
            </li>
          )}
          {notes.map((note, i) => (
            <NoteCard
              key={note.id}
              index={i + 1}
              text={note.text}
              author={note.author}
              onDelete={() => handleDelete(note.id)}
            />
          ))}
        </ol>
      </section>

      <FeedbackWidget userId={userId} />
    </main>
  );
}
