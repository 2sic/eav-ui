export interface DialogContextApp {
  GettingStartedUrl: string;
  Id: number;
  Identifier: unknown;
  Name: string;
  Url: string;
}

export interface DialogContextEnable {
  AppPermissions: boolean;
  CodeEditor: boolean;
  Query: boolean;
}

export interface DialogContextLanguage {
  All: DialogContextAllLangs;
  Current: string;
  Primary: string;
}

export interface DialogContextAllLangs {
  [key: string]: string;
}

export interface DialogContextPage {
  Id: number;
}

export interface DialogContextSite {
  Id: number;
  Url: string;
}

export interface DialogContextSystem {
  Url: string;
}
