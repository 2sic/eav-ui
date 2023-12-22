import { EntityReader } from '../../../shared/helpers/entity-reader';
import { EavConfig } from '../../../shared/models/eav-config.model';
import { ContentTypeItemService } from '../../../shared/store/ngrx-data';

export interface FieldLogicTools {
  eavConfig: EavConfig;
  entityReader: EntityReader;
  debug: boolean;
  contentTypeItemService: ContentTypeItemService;
}
