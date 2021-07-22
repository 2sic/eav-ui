export interface MetadataInfo {
  key: string;
  keyType: string;
  target: string;
}

export interface TargetTypeOption {
  type: number;
  target: string;
}

export interface MetadataFormValues {
  targetType: number;
  keyType: string;
  key: string | number;
}
