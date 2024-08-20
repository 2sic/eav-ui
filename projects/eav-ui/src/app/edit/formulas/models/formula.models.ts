import { Sxc } from '@2sic.com/2sxc-typings';
import { BehaviorSubject } from 'rxjs';
import { FieldSettings, FieldValue, PickerItem } from '../../../../../../edit-types';
import { FormulaIdentifier, FormulaResultRaw } from './formula-results.models';
import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';

/**
 * Formula Cached Values which are re-used across formulas of the same entity
 */
export interface FormulaCacheItemShared {
  /** Target information which stays the same across cycles, new cached in 14.07.05 */
  targetEntity: FormulaV1CtxTargetEntity;
  /** User which stays the same across cycles, new cached in 14.07.05 */
  user: FormulaV1CtxUser;
  /** App which stays the same across cycles, new cached in 14.07.05 */
  app: FormulaV1CtxApp;
  sxc: Sxc;
}

export interface FormulaCacheItem extends FormulaCacheItemShared, FormulaIdentifier {
  /** Data cache which can use inside the formula */
  cache: Record<string, any>;

  /** Function built when formula is saved */
  fn: FormulaFunction;

  /** Is formula currently being edited (not yet saved) */
  isDraft: boolean;

  /** Current formula string */
  source: string;

  /** Formula string in field settings */
  sourceFromSettings: string;

  sourceGuid: string;
  sourceId: number;

  /** Formula version - v1 or v2 */
  version: FormulaVersion;

  /** if the formula is stopped at the moment */
  stopFormula: boolean;
  promises$: BehaviorSubject<Promise<FieldValue | FormulaResultRaw>>;
  updateCallback$: BehaviorSubject<(result: FieldValue | FormulaResultRaw) => void>;
}

export type FormulaFunction = FormulaFunctionDefault | FormulaFunctionV1;

export type FormulaFunctionDefault = () => FieldValue | FormulaResultRaw;

export type FormulaFunctionV1 = (data: FormulaV1Data, context: FormulaV1Context, experimental: FormulaV1Experimental, item: PickerItem)
  => FieldValue | FormulaResultRaw;

export const FormulaVersions = {
  V1: 'v1',
  V2: 'v2',
} as const;

export type FormulaVersion = typeof FormulaVersions[keyof typeof FormulaVersions];

export const ListItemFormulaPrefix = 'Field.ListItem.';

export const SettingsFormulaPrefix = 'Field.Settings.';

export const FormulaListItemTargets = {
  ListItemLabel: `${ListItemFormulaPrefix}Label`,
  ListItemDisabled: `${ListItemFormulaPrefix}Disabled`,
  ListItemTooltip: `${ListItemFormulaPrefix}Tooltip`,
  ListItemInformation: `${ListItemFormulaPrefix}Information`,
  ListItemHelpLink: `${ListItemFormulaPrefix}HelpLink`,
}

export const FormulaOptionalTargets = {
  Collapsed: `${SettingsFormulaPrefix}Collapsed`,
  DropdownValues: `${SettingsFormulaPrefix}DropdownValues`,
}

export const FormulaDefaultTargets = {
  Disabled: `${SettingsFormulaPrefix}Disabled`,
  Name: `${SettingsFormulaPrefix}Name`,
  Notes: `${SettingsFormulaPrefix}Notes`,
  Required: `${SettingsFormulaPrefix}Required`,
  Value: 'Field.Value',
  Visible: `${SettingsFormulaPrefix}Visible`,
  Validation: 'Field.Validation',
};

export const FormulaTargets = {
  ...FormulaDefaultTargets,
  ...FormulaOptionalTargets,
  ...FormulaListItemTargets,
} as const;

export interface FormulaFieldValidation {
  severity: '' | 'error' | 'warning';
  message?: string;
}

export type FormulaTarget = typeof FormulaTargets[keyof typeof FormulaTargets];

export type FormulaProps = FormulaPropsV1;

export interface FormulaPropsV1 {
  data: FormulaV1Data;
  context: FormulaV1Context;
  experimental: FormulaV1Experimental;
  item?: PickerItem; //@SDV possibly add PickerTreeItem also
}

export interface FormulaV1Data {
  default: FieldValue;
  initial: FieldValue;
  parameters: Record<string, any>;
  prefill: FieldValue;
  value: FieldValue;
  [fieldName: string]: any;
}

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

export interface FormulaV1Experimental {
  getEntities(): FormulaV1ExperimentalEntity[];
  /**
   * This gets FIELD settings.
   * TODO: @2dm Must find out if it's used anywhere, and probably rename to getFieldSettings
   */
  getSettings(fieldName: string): FieldSettings;
  getValues(entityGuid: string): ItemValuesOfLanguage;
}

// TODO: once the id is gone, merge with the type FormulaV1CtxTargetEntityType
export interface FormulaV1ExperimentalEntity {
  guid: string;
  id: number;
  type: {
    id: string, // TODO: deprecate again, once we know it's not in use #cleanFormulaType
    name: string,
    guid: string,
  };
}
