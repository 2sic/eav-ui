import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { AppDialogConfigService } from '../../app-administration/services';
import { FeatureSummary } from '../../features/models/feature-summary.model';
import { DialogContext } from '../models/dialog-settings.model';

@Injectable({ providedIn: 'root' })
export class FeaturesService {

  dialogContext: DialogContext;

  constructor() { }

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

  isEnabled$(nameId: string) {
    const found = this.getAll().find(f => f.NameId === nameId);
    return of(found?.Enabled ?? false);
  }
}
