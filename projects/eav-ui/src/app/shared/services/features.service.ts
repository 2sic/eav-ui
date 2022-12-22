import { AppDialogConfigService } from '../../app-administration/services';
import { FeatureSummary } from '../../features/models/feature-summary.model';
import { DialogContext } from '../models/dialog-settings.model';

// TODO:
// - INJECT GLOBAL
// - trigger load in the edit-load
// - use this everywhere
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

  getAll(): FeatureSummary[] {
    return this.dialogContext?.Features ?? [];
  }

  isEnabled(nameId: string) {
    const found = this.getAll().find(f => f.NameId === nameId);
    return found?.Enabled ?? false;
  }
}
