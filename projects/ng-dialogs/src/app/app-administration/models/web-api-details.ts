
export interface WebApiDetails {
  controller: string;
  actions: WebApiAction[];
  security: WebApiSecurity;
}

export interface WebApiAction {
  /** Action name */
  name: string;

  /** Verbs which this action supports, typically GET, POST */
  verbs: string[];

  /** list of parameters for this action */
  parameters: WebApiActionParameters[];

  /** return type */
  returns: string;

  /** security information for this action - not yet provided by the backend */
  security: WebApiSecurity;
  mergedSecurity: WebApiSecurity;
}

export interface WebApiActionParameters {
  /** Parameter name like 'appId' */
  name: string;

  /** optional parameters don't need to be given */
  isOptional: boolean;

  /** if a param is optional, it will have a default value */
  defaultValue: string;

  /** the type int/string/bool etc. */
  type: string;

  /** If the param should be passed in the body */
  isBody: boolean;
}

export interface WebApiSecurity {
  ignoreSecurity: boolean;
  allowAnonymous: boolean;
  requireVerificationToken: boolean;
  view: boolean;
  edit: boolean;
  admin: boolean;
  superUser: boolean;
  requireContext: boolean;

}
