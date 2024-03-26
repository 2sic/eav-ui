import { Injectable } from '@angular/core';
import { map, Observable, ReplaySubject } from 'rxjs';
import { AppDialogConfigService } from '../../app-administration/services';
import { DialogContext } from '../models/dialog-settings.model';
import { ServiceBase } from './service-base';
import { EavLogger } from '../logging/eav-logger';
import { FeatureSummary } from '../../features/models/feature-summary.model';

const logThis = false;

/**
 * Singleton Service to provide information about enabled/disabled features.
 * 
 * It currently has a strange architecture, since it's singleton,
 * but needs context data.
 * So the AppDialogConfigService seems to call the loadFromService.
 * TODO: 2dm: I don't like this, should rethink the architecture, feels a bit flaky.
 */
@Injectable({ providedIn: 'root' })
export class FeaturesService extends ServiceBase {
  // new 2dm WIP
  // Provide context information and ensure that previously added data is always available
  private dialogContext$ = new ReplaySubject<DialogContext>(1);

  constructor() {
    super(new EavLogger('FeaturesService', logThis));
  }

  loadFromService(configService: AppDialogConfigService) {
    configService.getCurrent$().subscribe(ds => this.load(ds.Context));
  }

  load(dialogContext: DialogContext) {
    // new 2dm WIP
    this.dialogContext$.next(dialogContext);
  }

  // new 2dm WIP
  getAll$(): Observable<FeatureSummary[]> {
    return this.dialogContext$.pipe(map(dc => dc?.Features));
  }

  // new 2dm WIP
  get$(featureNameId: string): Observable<FeatureSummary> {
    return this.dialogContext$.pipe(
      // tap(f => console.log('2dm', f, featureNameId)),
      map(dc => dc?.Features.find(f => f.NameId === featureNameId))
    );
  }

  isEnabled$(nameId: string): Observable<boolean> {
    return this.get$(nameId).pipe(map(f => f?.IsEnabled ?? false));
  }

}
