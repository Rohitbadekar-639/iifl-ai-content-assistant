export interface Entry {
  id: number;
  original_text: string;
  summary: string;
  tags: string[];
  created_at: string;
}

export interface CreateEntryRequest {
  text: string;
}
