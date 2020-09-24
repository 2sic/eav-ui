export interface ImportAppResult {
  Messages: ImportAppResultMessage[];
  Success: boolean;
}

export interface ImportAppResultMessage {
  MessageType: 0 | 1 | 2;
  Text: string;
}
