import { EntityReader } from '../../shared/helpers/entity-reader';
import { ContentTypeItemService } from '../../shared/content-types/content-type-item.service';
import { FormConfiguration } from '../../form/form-configuration.model';

export interface FieldLogicTools {
  eavConfig: FormConfiguration;
  entityReader: EntityReader;
  debug: boolean;
  contentTypeItemService: ContentTypeItemService;
}
