import { EntityReader } from '../../shared/helpers/entity-reader';
import { ContentTypeItemService } from '../../shared/store/content-type-item.service';
import { FormConfiguration } from '../../state/form-configuration.model';

export interface FieldLogicTools {
  eavConfig: FormConfiguration;
  entityReader: EntityReader;
  debug: boolean;
  contentTypeItemService: ContentTypeItemService;
}
