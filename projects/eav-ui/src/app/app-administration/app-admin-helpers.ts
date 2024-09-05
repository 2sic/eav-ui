import { eavConstants } from '../shared/constants/eav.constants';
import { EditForm, EditPrep } from '../shared/models/edit-form.model';

export class AppAdminHelpers {
  public static getLightSpeedEditParams(appId: number) {
    const form: EditForm = {
      items: [
        EditPrep.newMetadata(appId, eavConstants.appMetadata.LightSpeed.ContentTypeName, eavConstants.metadata.app, true),
      ],
    };
    return form;
  }
}
