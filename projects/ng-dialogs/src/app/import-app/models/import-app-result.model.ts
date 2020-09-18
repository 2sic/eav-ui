export interface ImportAppResult {
  Messages: ImportAppResultMessage[];
  Succeeded: boolean;
}

export interface ImportAppResultMessage {
  MessageType: 0 | 1 | 2;
  Text: string;
}
