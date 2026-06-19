import { DevRestBaseModel } from '..';
import { WebApi, WebApiControllerDetails, WebApiControllerEndpoint } from '../../app-administration/models';

export interface DevRestApiModel extends DevRestBaseModel {
  webApi: WebApi;
  details: WebApiControllerDetails | null;
  endpoints: WebApiControllerEndpoint[];
  selected: WebApiControllerEndpoint | null;
}
