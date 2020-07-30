export interface TemplateSpec {
  ext: string;
  prefix: string;
  suggestion: string;
}

export interface TemplateTypes {
  [key: string]: TemplateSpec;
}
