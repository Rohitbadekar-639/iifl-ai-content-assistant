import type { Entry } from "../types/entry";

interface EntryListProps {
  entries: Entry[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function EntryList({ entries, selectedId, onSelect }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <section className="card">
        <h2>Saved Entries</h2>
        <p className="muted">No entries yet. Submit text to get started.</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Saved Entries</h2>
      <ul className="entry-list">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              className={selectedId === entry.id ? "selected" : ""}
              onClick={() => onSelect(entry.id)}
            >
              <strong>#{entry.id}</strong>
              <span>{entry.summary}</span>
              <time>{new Date(entry.created_at).toLocaleString()}</time>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
