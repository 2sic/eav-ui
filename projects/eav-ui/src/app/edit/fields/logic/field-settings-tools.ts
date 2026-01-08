import { FormConfiguration } from '../../form/form-configuration.model';
import { ContentTypeItemService } from '../../shared/content-types/content-type-item.service';
import { EntityReader } from '../../shared/helpers/entity-reader';

export interface FieldSettingsTools {
  eavConfig: FormConfiguration;
  reader: EntityReader;
  debug: boolean;
  contentTypeItemSvc: ContentTypeItemService;
}
