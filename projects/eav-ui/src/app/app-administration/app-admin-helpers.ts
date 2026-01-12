import { eavConstants } from '../shared/constants/eav.constants';
import { EditForm } from '../shared/models/edit-form.model';
import { ItemIdHelper } from '../shared/models/item-id-helper';

export class AppAdminHelpers {
  public static getLightSpeedEditParams(appId: number) {
    const form: EditForm = {
      items: [
        ItemIdHelper.newMetadata(appId, eavConstants.appMetadata.LightSpeed.ContentTypeName, eavConstants.metadata.app, true),
      ],
    };
    return form;
  }
}
