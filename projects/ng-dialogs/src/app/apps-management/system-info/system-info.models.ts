export interface SystemInfoTemplateVars {
  systemInfos: InfoTemplate[];
  siteInfos: InfoTemplate[];
}

export interface InfoTemplate {
  label: string;
  value: string;
}
