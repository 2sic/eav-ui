import { EntityReader } from '../../shared/helpers/entity-reader';
import { ContentTypeItemService } from '../../shared/content-types/content-type-item.service';
import { FormConfiguration } from '../../form/form-configuration.model';

export interface FieldLogicTools {
  eavConfig: FormConfiguration;
  reader: EntityReader;
  debug: boolean;
  contentTypeItemSvc: ContentTypeItemService;
}
