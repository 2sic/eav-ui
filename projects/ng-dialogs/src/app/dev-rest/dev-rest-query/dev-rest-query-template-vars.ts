import { Query } from '../../app-administration/models/query.model';
import { DevRestBaseTemplateVars } from '../dev-rest-base-template-vars';

export interface DevRestQueryTemplateVars extends DevRestBaseTemplateVars {
  query: Query;
}
