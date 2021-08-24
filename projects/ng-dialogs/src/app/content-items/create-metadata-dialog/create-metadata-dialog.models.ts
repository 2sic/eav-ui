export interface MetadataInfo {
  key: string;
  keyType: string;
  target: string;
}

export interface TargetTypeOption {
  keyType: string | undefined;
  label: string;
  type: number;
  target: string;
  hint?: string;
}

export interface MetadataFormValues {
  targetType: number;
  keyType: string;
  key: string | number;
}

export interface MetadataDialogTemplateVars {
  advancedMode: boolean;
  unknownTargetType: boolean;
  targetTypeOptions: TargetTypeOption[];
  targetTypeHint?: string;
  keyTypeOptions: string[];
  formValues: MetadataFormValues;
}
