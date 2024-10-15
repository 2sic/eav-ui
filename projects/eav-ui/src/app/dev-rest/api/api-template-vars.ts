import { DevRestBaseModel } from '..';
import { WebApi, WebApiAction, WebApiDetails } from '../../app-administration/models';

export interface DevRestApiModel extends DevRestBaseModel {
  webApi: WebApi;
  details: WebApiDetails;
  selected: WebApiAction;
}
