import { Injectable, Signal, computed, signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DialogContext } from '../shared/models/dialog-settings.model';
import { EavLogger } from '../shared/logging/eav-logger';
import { FeatureSummary } from './models/feature-summary.model';
import { SignalEquals } from '../shared/signals/signal-equals';
import { RxHelpers } from '../shared/rxJs/rx.helpers';
import { toObservable } from '@angular/core/rxjs-interop';
import { AppDialogConfigService } from '../app-administration/services/app-dialog-config.service';
import { transient } from '../core';

const logSpecs = {
  enabled: false,
  name: 'FeaturesService',
}

// TODO: @2dg - try to refactor the observables away so it only provides signals

/**
 * Singleton Service to provide information about enabled/disabled features.
 *
 * It currently has a strange architecture, since it's singleton,
 * but needs context data.
 * So the GlobalDialogConfigService seems to call the loadFromService.
 * TODO: 2dm: I don't like this, should rethink the architecture, feels a bit flaky.
 * 2024-08-28 2dm modified this, but still not perfect. 
 * ATM it would still load the dialog-settings by itself, even if the form service would provide it. on .load(...)
 */
@Injectable({ providedIn: 'root' })
export class FeaturesService {
  // new 2dm WIP
  // Provide context information and ensure that previously added data is always available
  private dialogContextSignal = signal<DialogContext>(null);
  private dialogContext$ = toObservable(this.dialogContextSignal);

  private dialogConfigSvc = transient(AppDialogConfigService);

  log = new EavLogger(logSpecs);
  constructor() {
    this.dialogConfigSvc.getCurrent$().subscribe(ds => this.load(ds.Context));
  }

  // loadFromService(configService: GlobalDialogConfigService) {
  //   configService.getCurrent$().subscribe(ds => this.load(ds.Context));
  // }

  load(dialogContext: DialogContext) {
    this.dialogContextSignal.set(dialogContext);
  }

  getAll(): Signal<FeatureSummary[]> {
    return computed(
      () => this.dialogContextSignal()?.Features ?? [],
      { equal: RxHelpers.arraysEqual }
    );
  }

  // TODO: @2dm - only used once, should be able to remove in ca. 20 mins
  get$(featureNameId: string): Observable<FeatureSummary> {
    return this.dialogContext$.pipe(
      map(dc => dc?.Features.find(f => f.nameId === featureNameId))
    );
  }

  getSignal(featureNameId: string): Signal<FeatureSummary> {
    return computed(
      () => this.dialogContextSignal()?.Features.find(f => f.nameId === featureNameId),
      { equal: RxHelpers.objectsEqual }
    );
  }

  isEnabled$(nameId: string): Observable<boolean> {
    return this.get$(nameId).pipe(map(f => f?.isEnabled ?? false));
  }

  isEnabled(nameId: string): Signal<boolean> {
    return computed(
      () => this.dialogContextSignal()?.Features.find(f => f.nameId === nameId)?.isEnabled ?? false,
      SignalEquals.bool
    );
  }
}
