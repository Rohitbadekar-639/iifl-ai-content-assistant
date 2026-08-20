import { useState } from "react";
import { createEntry } from "../api/client";
import type { Entry } from "../types/entry";

const MAX_LENGTH = 5000;

interface TextInputFormProps {
  onCreated: (entry: Entry) => void | Promise<void>;
}

export function TextInputForm({ onCreated }: TextInputFormProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please enter some text.");
      return;
    }

    setLoading(true);
    try {
      const entry = await createEntry({ text: trimmed });
      setText("");
      await onCreated(entry);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Analyze Text</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type content to summarize..."
        rows={6}
        maxLength={MAX_LENGTH}
        disabled={loading}
        aria-label="Text to analyze"
      />
      <div className="meta">
        <span>
          {text.length} / {MAX_LENGTH}
        </span>
        <button type="submit" disabled={loading || !text.trim()}>
          {loading ? "Analyzing..." : "Submit"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
