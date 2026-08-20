import { useCallback, useEffect, useState } from "react";
import { getEntry, listEntries } from "./api/client";
import { EntryDetail } from "./components/EntryDetail";
import { EntryList } from "./components/EntryList";
import { TextInputForm } from "./components/TextInputForm";
import type { Entry } from "./types/entry";
import "./App.css";

function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    const data = await listEntries();
    setEntries(data);
    setListError(null);
    return data;
  }, []);

  useEffect(() => {
    loadEntries().catch(() => {
      setEntries([]);
      setListError("Could not load saved entries. Is the backend running?");
    });
  }, [loadEntries]);

  useEffect(() => {
    if (selectedId === null) {
      setSelectedEntry(null);
      setDetailError(null);
      return;
    }

    setDetailLoading(true);
    setDetailError(null);
    getEntry(selectedId)
      .then(setSelectedEntry)
      .catch((err) => {
        setSelectedEntry(null);
        setDetailError(
          err instanceof Error ? err.message : "Failed to load entry.",
        );
      })
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  return (
    <div className="app">
      <header>
        <h1>AI Content Assistant</h1>
        <p>Summarize text and extract exactly three tags.</p>
      </header>

      <main>
        <TextInputForm
          onCreated={async (entry) => {
            await loadEntries();
            setSelectedId(entry.id);
          }}
        />
        {listError && <p className="error">{listError}</p>}
        <div className="grid">
          <EntryList
            entries={entries}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <EntryDetail
            entry={selectedEntry}
            loading={detailLoading}
            error={detailError}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
