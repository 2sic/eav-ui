import { AppDialogConfigService } from '../../app-administration/services';
import { DialogContextFeature } from '../models/dialog-context.models';
import { DialogContext } from '../models/dialog-settings.model';

export class FeaturesService {
  constructor(
    private dialogContext?: DialogContext,
  ) { }

  loadFromService(configService: AppDialogConfigService) {
    configService.getShared$().subscribe(ds => this.load(ds.Context));
  }

  load(dialogContext: DialogContext) {
    this.dialogContext = dialogContext;
  }

  getAll(): DialogContextFeature[] {
    return this.dialogContext?.Features ?? [];
  }

  isEnabled(nameId: string) {
    const found = this.getAll().find(f => f.NameId === nameId);
    return found?.Enabled ?? false;
  }
}
