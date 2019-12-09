export class ImportAppResult {
  Messages: ImportAppResultMessage[];
  Succeeded: boolean;
}

export class ImportAppResultMessage {
  MessageType: number;
  Text: string;
}
