import { EavPublishStatus } from '../../dialog/multi-item-edit-form/multi-item-edit-form.models';

export interface PublishStatus extends EavPublishStatus {
  formId: number;
}
