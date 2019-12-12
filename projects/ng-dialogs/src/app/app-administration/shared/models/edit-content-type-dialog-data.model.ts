import { Context } from '../../../shared/context/context';
import { ContentTypeEdit } from './content-type-edit.model';

export class EditContentTypeDialogData {
  constructor(
    public context: Context,
    public contentType: ContentTypeEdit,
  ) { }
}
