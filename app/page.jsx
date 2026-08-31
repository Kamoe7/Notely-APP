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
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

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
    <main className="min-h-screen dark:bg-neutral-950 dark:text-neutral-100">
      <header className="border-b border-line dark:border-neutral-800 px-6 py-8 sm:px-10">
        <div className="mx-auto flex max-w-3xl items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ledger dark:text-neutral-400">
              Notely
            </p>
            <h1 className="mt-1 font-display text-3xl italic text-ink dark:text-neutral-100 sm:text-4xl">
              Quick notes, kept in order.
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-full border border-line dark:border-neutral-800 px-4 py-2 font-mono text-xs uppercase tracking-wide text-ink/70 dark:text-neutral-300 transition hover:border-ink/40 dark:hover:border-neutral-600 hover:text-ink dark:hover:text-white"
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <button
              onClick={handleExport}
              className="rounded-full border border-line dark:border-neutral-800 px-4 py-2 font-mono text-xs uppercase tracking-wide text-ink/70 dark:text-neutral-300 transition hover:border-ink/40 dark:hover:border-neutral-600 hover:text-ink dark:hover:text-white"
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
            <p className="font-mono text-sm text-ink/40 dark:text-neutral-500">Loading notes…</p>
          )}
          {!loading && notes.length === 0 && (
            <li className="rounded-lg border border-dashed border-line dark:border-neutral-800 px-5 py-8 text-center font-body text-sm text-ink/50 dark:text-neutral-400">
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
