import { ContentType } from '../../app-administration/models/content-type.model';
import { DevRestBaseModel } from '../base-template-vars';

export interface DevRestDataModel extends DevRestBaseModel {
  contentType: ContentType;
  itemId: number;
}
