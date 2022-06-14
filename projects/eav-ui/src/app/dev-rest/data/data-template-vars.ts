import { ContentType } from '../../app-administration/models/content-type.model';
import { DevRestBaseTemplateVars } from '../base-template-vars';

export interface DevRestDataTemplateVars extends DevRestBaseTemplateVars {
  contentType: ContentType;
  itemId: number;
  itemGuid: string;
}
