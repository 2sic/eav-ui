import { Feature } from './feature.model';

export interface License {
  AutoEnable: boolean;
  Description: string;
  Features: Feature[];
  Guid: string;
  IsEnabled: boolean;
  Name: string;
  Priority: number;
}

export interface LicenseUploadInfo {
  Message: string;
  Success: boolean;
}

export type LicenseDownloadInfo = LicenseUploadInfo;
