import { LightSpeedInfo } from './LightSpeedInfo';

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
  /** LightSpeed info provided by the backend */
  lightSpeed?: LightSpeedInfo;
  Name: string;
  Thumbnail: string | null;
  Version: string;

  /** New 16.02 */
  HasCodeWarnings?: boolean;
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

