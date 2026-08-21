"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ShipNotifications({ userId }) {
  const [shipped, setShipped] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    if (!userId) return;
    // Requires a composite index the first time this runs — Firestore will
    // give you a console link in the error to create it with one click.
    const q = query(
      collection(db, "tickets"),
      where("userId", "==", userId),
      where("status", "==", "SHIPPED")
    );
    const unsub = onSnapshot(q, (snap) => {
      setShipped(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [userId]);

  const visible = shipped.filter((t) => t.notifiedAt && !dismissed.has(t.id));
  if (visible.length === 0) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 pt-6 sm:px-10">
      {visible.map((t) => (
        <div
          key={t.id}
          className="mb-3 flex items-center justify-between rounded-lg border border-ledger/30 bg-ledger/5 px-5 py-3"
        >
          <p className="font-body text-sm text-ledger">
            🎉 Your request "{t.title}" shipped
            {t.shippedVersion ? ` in ${t.shippedVersion}` : ""}.
          </p>
          <button
            onClick={() => setDismissed((s) => new Set(s).add(t.id))}
            className="font-mono text-xs text-ledger/60 hover:text-ledger"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
