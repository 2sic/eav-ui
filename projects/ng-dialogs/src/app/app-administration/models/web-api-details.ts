
export interface WebApiDetails {
  controller: string,
  actions: WebApiAction[],
}

export interface WebApiAction {
  name: string,
  verbs: string[],
  parameters: WebApiActionParameters[],
  returns: string,
  security: string[],
}

export interface WebApiActionParameters {
  name: string,
  isOptional: boolean,
  defaultValue: string,
  type: string,
}
