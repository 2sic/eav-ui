export interface UrlDataSpecs {
  fields: string | undefined;
  parameters: Record<string, unknown> | undefined;
}

export interface AddPartsSpecs {
  metadata?: boolean,
  prefill?: boolean,
  fields?: boolean,
  params?: boolean,
  duplicate?: boolean,
  save?: string
}
