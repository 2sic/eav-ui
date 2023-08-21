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

  /** New 16.02 */
  HasCodeWarnings?: boolean;
}

export interface LightspeedEntityInfo {
  Id: number;
  IsEnabled: boolean;
  Title: string;
}

export interface PendingApp {
  // folder as it's stored on the server
  ServerFolder: string;
  // taken from the app.xml
  Name: string;
  // taken from the app.xml
  Description: string;
  // taken from the app.xml
  Version: string;
  // taken from the app.xml
  Folder: string;
}

