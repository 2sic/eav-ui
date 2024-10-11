import { Query } from '../../app-administration/models/query.model';
import { DevRestBaseModel } from '../base-template-vars';

export interface DevRestQueryModel extends DevRestBaseModel {
  query: Query;
}
