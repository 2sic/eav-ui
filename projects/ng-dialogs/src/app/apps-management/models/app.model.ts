export interface App {
  AppRoot: string;
  AppSharedRoot: string;
  ConfigurationId: number;
  Folder: string;
  Guid: string;
  Id: number;
  IsApp: boolean;
  IsGlobal: boolean;
  IsHidden: boolean;
  IsInherited: boolean;
  Items: number;
  Lightspeed?: LightspeedEntityInfo;
  Name: string;
  Thumbnail: string | null;
  Version: string;
}

export interface LightspeedEntityInfo {
  Id: number;
  IsEnabled: boolean;
  Title: string;
}
