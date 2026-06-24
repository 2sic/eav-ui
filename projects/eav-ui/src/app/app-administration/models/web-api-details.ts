
export interface WebApiControllerDetails {
  Controller: string;
  Path: string;
  IgnoreSecurity: boolean;
  AllowAnonymous: boolean;
  RequireVerificationToken: boolean;
  ValidateAntiForgeryToken: boolean;
  AutoValidateAntiforgeryToken: boolean;
  IgnoreAntiforgeryToken: boolean;
  View: boolean;
  Edit: boolean;
  Admin: boolean;
  SuperUser: boolean;
  RequireContext: boolean;
}

export interface WebApiControllerEndpoint {
  Name: string;
  EndpointPath: string;
  Returns: string;
  Verbs: string;
  Parameters?: WebApiControllerParameter[];
  Security?: WebApiSecurity;
  IgnoreSecurity: boolean;
  AllowAnonymous: boolean;
  RequireVerificationToken: boolean;
  View: boolean;
  Edit: boolean;
  Admin: boolean;
  SuperUser: boolean;
  RequireContext: boolean;
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
