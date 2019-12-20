import { ContentType } from './content-type.model';

export class EditFieldsDialogData {
  constructor(
    public appId: number,
    public contentType: ContentType,
  ) { }
}
