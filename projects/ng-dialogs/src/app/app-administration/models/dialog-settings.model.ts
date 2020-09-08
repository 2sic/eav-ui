export interface DialogSettings {
  Context: DialogContext;
}

export interface DialogContext {
  App: DialogContextApp;
  Enable: DialogContextEnable;
  Language: DialogContextLanguage;
  Page: DialogContextPage;
  Site: DialogContextSite;
  System: DialogContextSystem;
}

export interface DialogContextApp {
  GettingStartedUrl: string;
  Id: number;
  Identifier: string;
  Name: string;
  Url: string;
}

export interface DialogContextEnable {
  AppPermissions: boolean;
  CodeEditor: boolean;
  Query: boolean;
}

export interface DialogContextLanguage {
  All: DialogContextLanguageAll;
  Current: string;
  Primary: string;
}

export interface DialogContextLanguageAll {
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
