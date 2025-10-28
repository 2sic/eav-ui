import { Observable } from 'rxjs';
import { Of } from '../../../../../../core';

export interface FileUploadDialogData {
  title?: string;
  description?: string;
  allowedFileTypes?: string;
  files?: File[];
  multiple?: boolean;
  // upload$?(files: File[]): Observable<FileUploadResult>;
  upload$?(files: File[], name?: string): Observable<FileUploadResult>;
}

export enum ImportModeValues {
  importOriginal = 'importOriginal',
  importAsTemplate = 'importAsTemplate',
}


export interface FileUploadResult {
  Messages: FileUploadResultMessage[];
  Success: boolean;
}

export interface FileUploadResultMessage {
  MessageType: Of<typeof FileUploadMessageTypes>;
  Text: string;
}

export const FileUploadMessageTypes = {
  Warning: 0,
  Success: 1,
  Error: 2,
} as const /* the as const ensures that the keys/values can be strictly checked */;

export const UploadTypes = {
  App: 0,
  AppPart: 1,
  ContentType: 2,
  ContentItem: 3,
  Query: 4,
  View: 5,
  ImportParts: 6,
  Extension: 7,
} as const /* the as const ensures that the keys/values can be strictly checked */;
