export interface SystemInfoTemplateVars {
  systemInfos: InfoTemplate[];
  siteInfos: InfoTemplate[];
  loading: boolean;
}

export interface InfoTemplate {
  label: string;
  value: string;
  link?: string;
}
