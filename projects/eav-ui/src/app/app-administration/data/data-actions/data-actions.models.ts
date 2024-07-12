import { ContentType } from '../../models/content-type.model';

export type DataActionType = 'createUpdateMetaData' | 'openPermissions' | 'editContentType' | 'openMetadata' | 'openRestApi' | 'typeExport' | 'dataExport' | 'dataImport' | 'deleteContentType';

export interface DataActionsParams {
  enablePermissionsGetter(): boolean;
  do(verb: DataActionType, contentType: ContentType): void;
}
