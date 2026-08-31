export default function NoteCard({ index, text, author, onDelete }) {
  return (
    <li className="group flex items-start gap-4 rounded-lg border border-line bg-white/60 px-5 py-4 transition hover:border-ledger/40 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600">
      <span className="mt-0.5 font-mono text-xs text-ledger2/70 dark:text-gray-400">
        {String(index).padStart(2, "0")}
      </span>
      <div className="flex-1">
        <p className="font-body text-sm leading-relaxed text-ink dark:text-gray-100">{text}</p>
        {author && (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-ink/35 dark:text-gray-400">
            {author}
          </p>
        )}
      </div>
      <button
        onClick={onDelete}
        aria-label="Delete note"
        className="font-mono text-xs text-ink/30 opacity-0 transition hover:text-flag group-hover:opacity-100 focus-visible:opacity-100 dark:text-gray-400 dark:hover:text-red-400"
      >
        Delete
      </button>
    </li>
  );
}
