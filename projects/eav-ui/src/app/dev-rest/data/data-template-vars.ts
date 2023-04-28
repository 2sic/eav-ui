import { ContentType } from '../../app-administration/models/content-type.model';
import { DevRestBaseViewModel } from '../base-template-vars';

export interface DevRestDataViewModel extends DevRestBaseViewModel {
  contentType: ContentType;
  itemId: number;
  itemGuid: string;
}
