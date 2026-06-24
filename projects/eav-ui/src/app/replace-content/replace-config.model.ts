export interface ReplaceConfig {
  selectedId: number;
  items: ReplaceOption[];
}

export interface ReplaceOption {
  id: number;
  title: string;
  contentType: string;
}