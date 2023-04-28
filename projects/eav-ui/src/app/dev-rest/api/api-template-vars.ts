import { DevRestBaseViewModel } from '..';
import { WebApi, WebApiAction, WebApiDetails } from '../../app-administration/models';

export interface DevRestApiViewModel extends DevRestBaseViewModel {
  webApi: WebApi;
  details: WebApiDetails;
  selected: WebApiAction;
}
