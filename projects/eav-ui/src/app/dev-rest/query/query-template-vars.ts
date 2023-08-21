import { Query } from '../../app-administration/models/query.model';
import { DevRestBaseViewModel } from '../base-template-vars';

export interface DevRestQueryViewModel extends DevRestBaseViewModel {
  query: Query;
}
