import { EntityReader } from '../../shared/helpers/entity-reader';
import { FormConfiguration } from '../../state/form-configuration.model';
import { ContentTypeItemService } from '../../shared/store/ngrx-data';

export interface FieldLogicTools {
  eavConfig: FormConfiguration;
  entityReader: EntityReader;
  debug: boolean;
  contentTypeItemService: ContentTypeItemService;
}
