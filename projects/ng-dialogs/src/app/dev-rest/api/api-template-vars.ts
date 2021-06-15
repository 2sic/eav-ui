import { DevRestBaseTemplateVars } from '..';
import { WebApi, WebApiAction, WebApiDetails } from '../../app-administration/models';

export interface DevRestApiTemplateVars extends DevRestBaseTemplateVars {
  webApi: WebApi;
  details: WebApiDetails;
  selected: WebApiAction;
}
