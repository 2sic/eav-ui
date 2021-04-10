import { ContentType } from '../../app-administration/models/content-type.model';
import { DevRestBaseTemplateVars } from '../dev-rest-base-template-vars';

export interface DevRestDataTemplateVars extends DevRestBaseTemplateVars {
  contentType: ContentType;
  itemId: number;
  itemGuid: string;
}
