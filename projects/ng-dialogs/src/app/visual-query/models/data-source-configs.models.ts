export interface DataSourceConfigs {
  [id: number]: DataSourceConfig[];
}

export interface DataSourceConfig {
  name: string;
  value: any;
}
