/**
 * @custom-json-editor
 */
export interface CustomJsonEditor {
  Rows: number;
  JsonValidation: 'strict' | 'light' | 'none';
  JsonSchemaMode: 'strict' | 'light' | 'none';
  JsonSchemaSource: 'link' | 'raw';
  JsonSchemaUrl: string;
  JsonSchemaRaw: string;
  JsonCommentsAllowed: boolean;
}
