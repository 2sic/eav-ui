import { EntityReader } from '../../../shared/helpers/entity-reader';
import { EavConfig } from '../../../shared/models/eav-config.model';

export interface FieldLogicTools {
  eavConfig: EavConfig;
  entityReader: EntityReader;
  debug: boolean;
}
