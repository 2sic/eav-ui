import { Injectable, Signal, signal } from '@angular/core';
import { Of, transient } from '../../../../core';
import { DialogConfigAppService } from '../app-administration/services/dialog-config-app.service';
import { EavEditLoadDto } from '../edit/dialog/main/edit-dialog-main.models';
import { classLog } from '../shared/logging';
import { DialogContext } from '../shared/models/dialog-settings.model';
import { ComputedCacheHelper } from '../shared/signals/computed-cache';
import { computedObj, signalObj } from '../shared/signals/signal.utilities';
import { FeatureNames } from './feature-names';
import { FeatureSummary } from './models/feature-summary.model';

const logSpecs = {
  all: false,
  constructor: false,
  load: false,
  getAll: false,
  requireFeature: true,
  unlicensedFeatures: true,
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

  load(dialogContext: DialogContext, formData?: EavEditLoadDto) {
    this.log.fnIf('load', { formData, dialogContext });
    this.#dialogContext.set(dialogContext);
    this.#reqFeaturesForm.set(formData?.RequiredFeatures ?? {} as Record<Of<typeof FeatureNames>, string[]>);
  }

  // Provide context information and ensure that previously added data is always available
  #dialogContext = signal<DialogContext>(null);

  /** Required features specified by the entire form */
  #reqFeaturesForm = signalObj('reqFeaturesForm', {} as Record<Of<typeof FeatureNames>, string[]>);

  /** Required features specified by specific fields */
  #reqFeaturesFields = signalObj('reqFeaturesFields', {} as Record<Of<typeof FeatureNames>, string[]>);

  /** All required features merged */
  #reqFeatures = computedObj<Record<Of<typeof FeatureNames>, string[]>>('requiredFeatures', () => {
    const req = this.#reqFeaturesForm();
    const fields = this.#reqFeaturesFields();
    return {...req, ...fields};
  });

  requireFeature(feature: Of<typeof FeatureNames>, reason: string) {
    const l = this.log.fnIf('requireFeature', { feature, reason });
    const current = this.#reqFeaturesFields();
    if (!Object.keys(current).includes(feature))
      this.#reqFeaturesFields.update(current => ({...current, [feature]: [reason]}));
    else if (!current[feature].includes(reason))
      this.#reqFeaturesFields.update(current => ({...current, [feature]: [...current[feature], reason]}));
    l.end('final', this.#reqFeaturesFields());
  }


  public unlicensedFeatures = computedObj<string[]>('unlicensedFeatures', () => {
    const req = this.#reqFeatures();
    const allowed = this.getAll()().filter(f => f.allowUse);
    const missing = Object.keys(req).filter(nameId => !allowed.some(f => f.nameId === nameId));
    this.log.aIf('unlicensedFeatures', { req, allowed, missing });
    return missing;
  });

  public hasUnlicensedFeatures = computedObj('hasUnlicensedFeatures', () => this.unlicensedFeatures().length > 0);

  getAll(): Signal<FeatureSummary[]> {
    this.log.fnIf('getAll');
    return computedObj('all-features', () => this.#dialogContext()?.Features ?? []);
  }

  getCurrent(featureNameId: string): FeatureSummary {
    return this.#dialogContext()?.Features.find(f => f.nameId === featureNameId);
  }

  /**
   * Property providing enabled, which behaves like a Record<string, Signal<boolean>>.
   */
  public isEnabled = new ComputedCacheHelper<Of<typeof FeatureNames>, boolean>('isEnabledCache').buildProxy(nameId => () => {
    return this.#dialogContext()?.Features.find(f => f.nameId === nameId)?.isEnabled ?? false;
  });

  /**
   * Property providing allowUse, which behaves like a Record<string, Signal<boolean>>.
   * This is primarily meant for the field-wrapper, which
   * - should show warnings etc. if not allowed
   * - but in edge cases it is allowed, eg. when editing data on a system content-type
   */
  public allowUse = new ComputedCacheHelper<Of<typeof FeatureNames>, boolean>('isEnabledCache').buildProxy(nameId => () => {
    return this.#dialogContext()?.Features.find(f => f.nameId === nameId)?.allowUse ?? false;
  });

}
