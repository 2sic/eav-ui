export interface FieldConfigBase {
  /**
   * spm 2019.03.29 write JSDoc for every property
   */
  disabled?: boolean;
  label?: string;
  name: string;
  type?: string;
  index?: number;
  disableI18n?: boolean;
}
