import type { CreateEntryRequest, Entry } from "../types/entry";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail =
      typeof body?.detail === "string"
        ? body.detail
        : `Request failed (${response.status})`;
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export function createEntry(payload: CreateEntryRequest): Promise<Entry> {
  return request<Entry>("/entries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listEntries(): Promise<Entry[]> {
  return request<Entry[]>("/entries");
}

export function getEntry(id: number): Promise<Entry> {
  return request<Entry>(`/entries/${id}`);
}
