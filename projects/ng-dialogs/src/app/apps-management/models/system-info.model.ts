export interface SystemInfoSet {
  License: LicenseInfo;
  Messages: WarningsCount;
  Site: SiteStats;
  System: SystemInfo;
}

export interface LicenseInfo {
  Count: number;
  Main: string;
  Owner: string | null;
}

export interface WarningsCount {
  WarningsObsolete: number;
  WarningsOther: number;
}

export interface SiteStats {
  Apps: number;
  Languages: number;
  SiteId: number;
  ZoneId: number;
}

export interface SystemInfo {
  EavVersion: string;
  Fingerprint: string;
  Platform: string;
  PlatformVersion: string;
  Zones: number;
}
