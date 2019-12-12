import { Context } from '../../../shared/context/context';
import { ContentType } from './content-type.model';

export class EditContentTypeDialogData {
  constructor(
    public context: Context,
    public contentType: ContentType,
  ) { }
}
