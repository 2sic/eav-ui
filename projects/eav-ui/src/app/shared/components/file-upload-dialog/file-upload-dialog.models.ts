import { Observable } from 'rxjs';

export interface FileUploadDialogData {
  title?: string;
  description?: string;
  allowedFileTypes?: string;
  files?: File[];
  multiple?: boolean;
  upload$?(files: File[]): Observable<FileUploadResult>;
}

export interface FileUploadResult {
  Messages: FileUploadResultMessage[];
  Success: boolean;
}

export interface FileUploadResultMessage {
  MessageType: FileUploadMessageType;
  Text: string;
}

export const FileUploadMessageTypes = {
  Warning: 0,
  Success: 1,
  Error: 2,
} as const;

export type FileUploadMessageType = typeof FileUploadMessageTypes[keyof typeof FileUploadMessageTypes];
