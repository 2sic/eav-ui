export interface WebApiControllerDetails {
  controller: string;
  path: string;
  ignoreSecurity: boolean;
  allowAnonymous: boolean;
  requireVerificationToken: boolean;
  validateAntiForgeryToken: boolean;
  autoValidateAntiforgeryToken: boolean;
  ignoreAntiforgeryToken: boolean;
  view: boolean;
  edit: boolean;
  admin: boolean;
  superUser: boolean;
  requireContext: boolean;
}

export interface WebApiControllerEndpoint {
  name: string;
  endpointPath: string;
  returns: string;
  verbs: string;
  parameters?: WebApiControllerParameter[];
  security?: WebApiSecurity;
  ignoreSecurity: boolean;
  allowAnonymous: boolean;
  requireVerificationToken: boolean;
  view: boolean;
  edit: boolean;
  admin: boolean;
  superUser: boolean;
  requireContext: boolean;
}

export interface WebApiControllerParameter {
  name?: string;
  type?: string;
  defaultValue?: unknown;
  isOptional?: boolean;
  isBody?: boolean;
}

export interface WebApiSecurity {
  ignoreSecurity?: boolean;
  allowAnonymous?: boolean;
  requireVerificationToken?: boolean;
  _validateAntiForgeryToken?: boolean;
  _autoValidateAntiforgeryToken?: boolean;
  _ignoreAntiforgeryToken?: boolean;
  view?: boolean;
  edit?: boolean;
  admin?: boolean;
  superUser?: boolean;
  requireContext?: boolean;
}
