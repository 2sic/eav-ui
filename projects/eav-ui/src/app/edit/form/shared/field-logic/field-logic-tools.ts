import { EntityReader } from '../../../shared/helpers/entity-reader';
import { FormConfiguration } from '../../../shared/models/form-configuration';
import { ContentTypeItemService } from '../../../shared/store/ngrx-data';

export interface FieldLogicTools {
  eavConfig: FormConfiguration;
  entityReader: EntityReader;
  debug: boolean;
  contentTypeItemService: ContentTypeItemService;
}
