export interface SystemInfoSet {
  License: LicenseInfo;
  Site: SiteStats;
  System: SystemInfo;
}

export interface LicenseInfo {
  Count: number;
  Main: string;
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
