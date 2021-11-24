export interface PredefinedTemplatesResponse {
  Default: string;
  Templates: PredefinedTemplate[];
}

export interface PredefinedTemplate {
  Body: string;
  Description: string;
  Extension: string;
  Key: string;
  Name: string;
  Platforms: string[];
  Prefix?: string;
  Purpose: string;
  Suffix?: string;
}
