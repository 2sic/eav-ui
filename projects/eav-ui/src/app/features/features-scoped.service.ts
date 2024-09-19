import { Injectable, Signal, signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DialogContext } from '../shared/models/dialog-settings.model';
import { FeatureSummary } from './models/feature-summary.model';
import { toObservable } from '@angular/core/rxjs-interop';
import { DialogConfigAppService } from '../app-administration/services/dialog-config-app.service';
import { Of, transient } from '../core';
import { classLog } from '../shared/logging';
import { computedObj } from '../shared/signals/signal.utilities';
import { ComputedCacheHelper } from '../shared/signals/computed-cache';
import { FeatureNames } from './feature-names';

const logSpecs = {
  all: true,
  constructor: false,
  load: false,
  getAll: false,
  getSignal: false,
};

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
@Injectable()
export class FeaturesScopedService {
  
  log = classLog({FeaturesScopedService}, logSpecs, true);

  #dialogConfigSvc = transient(DialogConfigAppService);

  constructor() {
    this.log.fnIf('constructor');
    this.#dialogConfigSvc.getCurrent$().subscribe(ds => this.load(ds.Context));
  }

  // new 2dm WIP
  // Provide context information and ensure that previously added data is always available
  private dialogContext = signal<DialogContext>(null);
  private dialogContext$ = toObservable(this.dialogContext);


  load(dialogContext: DialogContext) {
    this.log.fnIf('load', { dialogContext });
    this.dialogContext.set(dialogContext);
  }

  getAll(): Signal<FeatureSummary[]> {
    this.log.fnIf('getAll');
    return computedObj('all-features', () => this.dialogContext()?.Features ?? []);
  }

  // TODO: @2dm - only used once, should be able to remove in ca. 20 mins
  get$(featureNameId: string): Observable<FeatureSummary> {
    return this.dialogContext$.pipe(
      map(dc => dc?.Features.find(f => f.nameId === featureNameId))
    );
  }

  // FYI: Not in use yet, if ever needed, should be changed to use a ComputedCacheHelper
  getSignal(featureNameId: string): Signal<FeatureSummary> {
    this.log.fnIf('getSignal', { featureNameId });
    return computedObj('feature-' + featureNameId, () => this.dialogContext()?.Features.find(f => f.nameId === featureNameId));
  }

  isEnabled$(nameId: string): Observable<boolean> {
    return this.get$(nameId).pipe(map(f => f?.isEnabled ?? false));
  }

  // TODO: @2dg pls change use of this to use the `enabled` property below, eg. `enabled['nameId']` returns a signal
  isEnabled(nameId: Of<typeof FeatureNames>): Signal<boolean> {
    return computedObj('isEnabled-' + nameId,() => this.dialogContext()?.Features.find(f => f.nameId === nameId)?.isEnabled ?? false);
  }

  /**
   * Property which behaves like a Record<string, Signal<boolean>>.
   */
  public enabled = new ComputedCacheHelper<Of<typeof FeatureNames>, boolean>('isEnabledCache').buildProxy(nameId => () => {
    return this.dialogContext()?.Features.find(f => f.nameId === nameId)?.isEnabled ?? false;
  });
}
