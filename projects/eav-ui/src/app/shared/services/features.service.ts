import { Injectable } from '@angular/core';
import { map, ReplaySubject } from 'rxjs';
import { AppDialogConfigService } from '../../app-administration/services';
import { FeatureSummary } from '../../features/models/feature-summary.model';
import { DialogContext } from '../models/dialog-settings.model';

@Injectable({ providedIn: 'root' })
export class FeaturesService {
  // TODO: @SDV - stop using this
  dialogContext: DialogContext;
  // new 2dm WIP
  // Provide context information and ensure that previously added data is always available
  private dialogContext$ = new ReplaySubject<DialogContext>(1);

  constructor() { }

  loadFromService(configService: AppDialogConfigService) {
    configService.getShared$().subscribe(ds => this.load(ds.Context));
  }

  load(dialogContext: DialogContext) {
    this.dialogContext = dialogContext;
    // new 2dm WIP
    this.dialogContext$.next(dialogContext);
  }

  private getAll(): FeatureSummary[] {
    return this.dialogContext?.Features ?? [];
  }

  // getFeature(featureNameId: string): FeatureSummary {
  //   return this.dialogContext?.Features.find(f => f.NameId === featureNameId);
  // }

  // new 2dm WIP
  get$(featureNameId: string) {
    return this.dialogContext$.pipe(
      // tap(f => console.log('2dm', f, featureNameId)),
      map(dc => dc?.Features.find(f => f.NameId === featureNameId))
    );
  }

  // TODO: @SDV - make sure we stop using this and use the reactive only below
  isEnabled(nameId: string) {
    const found = this.getAll().find(f => f.NameId === nameId);
    return found?.Enabled ?? false;
  }

  isEnabled$(nameId: string) {
    return this.get$(nameId).pipe(map(f => f?.Enabled ?? false));
  }
}
