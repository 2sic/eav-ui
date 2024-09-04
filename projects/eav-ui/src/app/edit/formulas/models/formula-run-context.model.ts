import { Sxc } from '@2sic.com/2sxc-typings';


export interface FormulaV1Context {
  app: FormulaV1CtxApp;
  cache: Record<string, any>;
  culture: FormulaV1CtxCulture;
  debug: boolean;
  features: FormulaV1CtxFeatures;
  form: FormulaV1CtxForm;
  sxc: Sxc;
  target: FormulaV1CtxTarget;
  user: FormulaV1CtxUser;
}

export interface FormulaV1CtxApp {
  appId: number;
  zoneId: number;
  isGlobal: boolean;
  isSite: boolean;
  isContent: boolean;

  /**
   * WIP new v15.01
   * @param settingPath eg "Settings.GoogleMaps.DefaultCoordinates"
   */
  getSetting: (settingPath: string) => unknown;
}

export interface FormulaV1CtxCulture {
  code: string;
  name: string;
}

export interface FormulaV1CtxFeatures {
  isEnabled(name: string): boolean;
}

export interface FormulaV1CtxForm {
  runFormulas(): void;
}

export interface FormulaV1CtxTarget {
  entity: FormulaV1CtxTargetEntity;
  name: string;
  type: string;
}

export interface FormulaV1CtxTargetEntity {
  guid: string;
  id: number;
  type?: FormulaV1CtxTargetEntityType;
  /**
   * New 15.04 - metadata for information
   */
  for: FormulaV1CtxMetadataFor;
}

export interface FormulaV1CtxMetadataFor {
  targetType: number;
  number?: number;
  string?: string;
  guid?: string;
}
// WIP
interface FormulaV1CtxTargetEntityType {
  guid: string;
  name: string;
  // Future: the int-id; ATM not available
  id?: number;
}
export interface FormulaV1CtxUser {
  email: string;
  guid: string;
  id: number;
  isAnonymous: boolean;
  isSiteAdmin: boolean;
  isSystemAdmin: boolean;
  isContentAdmin: boolean;
  name: string;
  username: string;
}
