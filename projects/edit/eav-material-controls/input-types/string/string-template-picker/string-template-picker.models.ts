export interface TemplateSpec {
  ext: string;
  prefix: string;
  suggestion: string;
  body: string;
}

export interface TemplateTypes {
  [key: string]: TemplateSpec;
}
