export interface SystemInfoViewModel {
  systemInfos: InfoTemplate[];
  siteInfos: InfoTemplate[];
  loading: boolean;
  warningIcon: string;
  warningInfos: InfoTemplate[];
  lsEnabled: boolean;
  cspEnabled: boolean;
}

export interface InfoTemplate {
  label: string;
  value: string;
  link?: InfoTemplateLink;
}

export interface InfoTemplateLink {
  url: string;
  label: string;
  target: 'angular' | '_self' | '_blank';
}
