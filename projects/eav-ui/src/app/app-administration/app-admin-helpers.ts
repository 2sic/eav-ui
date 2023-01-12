import { eavConstants } from '../shared/constants/eav.constants';
import { EditForm } from '../shared/models/edit-form.model';

export class AppAdminHelpers {
  public static getLightSpeedEditParams(appId: number) {
    const form: EditForm = {
      items: [
        {
          ContentTypeName: eavConstants.appMetadata.LightSpeed.ContentTypeName,
          For: {
            Target: eavConstants.metadata.app.target,
            TargetType: eavConstants.metadata.app.targetType,
            Number: appId,
            Singleton: true,
          },
        },
      ],
    };
    return form;
  }
}
