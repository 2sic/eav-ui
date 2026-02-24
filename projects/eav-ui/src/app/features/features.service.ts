import { Injectable, Signal, signal } from '@angular/core';
import { Of, transient } from '../../../../core';
import { classLog } from '../../../../shared/logging';
import { DialogConfigAppService } from '../app-administration/services/dialog-config-app.service';
import { EavEditLoadDto, RequiredFeatures } from '../edit/dialog/main/edit-dialog-main.models';
import { DialogContext } from '../shared/models/dialog-settings.model';
import { ComputedCacheHelper } from '../shared/signals/computed-cache';
import { computedObj, signalObj } from '../shared/signals/signal.utilities';
import { FeatureNames } from './feature-names';
import { FeaturesDisableAutoLoadService } from './features-disable-autoload.service';
import { FeatureSummary } from './models/feature-summary.model';

const logSpecs = {
  all: false,
  constructor: true,
  load: false,
  getAll: false,
  requireFeature: true,
  unlicensedFeatures: true,
};

/**
 * Service to provide information about enabled/disabled features.
 */
@Injectable()
export class FeaturesService {

  log = classLog({FeaturesService}, logSpecs);

  #dialogConfigSvc = transient(DialogConfigAppService);

  constructor(disableAutoLoad: FeaturesDisableAutoLoadService) {
    this.log.fnIf('constructor');

    // If auto-load is disable (special edge case when opening the dialog directly to the edit-form)
    // then don't do this, because in some cases the person opening the dialog doesn't have the necessary permission.
    if (!disableAutoLoad.disableAutoLoad)
      this.#dialogConfigSvc.getCurrent$().subscribe(ds => this.load(ds.Context));
    else
      this.log.a('auto-load disabled');
  }

  load(dialogContext: DialogContext, formData?: EavEditLoadDto) {
    this.log.fnIf('load', { formData, dialogContext });
    this.#dialogContext.set(dialogContext);
    this.#reqFeaturesForm.set(formData?.RequiredFeatures ?? {} as RequiredFeatures);
  }

  // Provide context information and ensure that previously added data is always available
  #dialogContext = signal<DialogContext>(null);

  /** Required features specified by the entire form */
  #reqFeaturesForm = signalObj('reqFeaturesForm', {} as RequiredFeatures);

  /** Required features specified by specific fields */
  #reqFeaturesFields = signalObj('reqFeaturesFields', {} as RequiredFeatures);

  /** All required features merged */
  #reqFeatures = computedObj<RequiredFeatures>('requiredFeatures', () => {
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
