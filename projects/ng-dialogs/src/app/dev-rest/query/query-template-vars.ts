import { Query } from '../../app-administration/models/query.model';
import { DevRestBaseTemplateVars } from '../base-template-vars';

export interface DevRestQueryTemplateVars extends DevRestBaseTemplateVars {
  query: Query;
}
