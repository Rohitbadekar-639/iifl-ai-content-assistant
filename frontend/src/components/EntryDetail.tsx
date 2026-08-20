import type { Entry } from "../types/entry";

interface EntryDetailProps {
  entry: Entry | null;
  loading: boolean;
  error: string | null;
}

export function EntryDetail({ entry, loading, error }: EntryDetailProps) {
  if (loading) {
    return (
      <section className="card">
        <h2>Entry Detail</h2>
        <p className="muted">Loading...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card">
        <h2>Entry Detail</h2>
        <p className="error">{error}</p>
      </section>
    );
  }

  if (!entry) {
    return (
      <section className="card">
        <h2>Entry Detail</h2>
        <p className="muted">Select an entry to view details.</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Entry #{entry.id}</h2>
      <p className="label">Original Text</p>
      <p className="text-block">{entry.original_text}</p>
      <p className="label">Summary</p>
      <p className="summary-text">{entry.summary}</p>
      <p className="label">Tags</p>
      <div className="tags">
        {entry.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      <p className="muted created-at">
        Created {new Date(entry.created_at).toLocaleString()}
      </p>
    </section>
  );
}
