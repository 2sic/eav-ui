export class ImportAppPartsResult {
  Succeeded: boolean;
  Messages: ImportAppPartsResultMessage[];
}

export class ImportAppPartsResultMessage {
  Text: string;
  MessageType: number;
}
