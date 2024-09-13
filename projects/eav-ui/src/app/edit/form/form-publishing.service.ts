import { Injectable, Signal } from '@angular/core';
import { FormConfigService } from './form-config.service';
import { PublishStatus, PublishMode, PublishModes, EavPublishStatus } from '../dialog/main/edit-dialog-main.models';
import { ComputedCacheHelper } from '../../shared/signals/computed-cache';
import { SignalStoreBase } from '../shared/store/signal-store-base';
import { classLog } from '../../shared/logging';

@Injectable({ providedIn: 'root' })
export class FormPublishingService extends SignalStoreBase<number, PublishStatus> {
  
  constructor() {
    super(classLog({FormPublishingService}));
  }

  override getId = (item: PublishStatus) => item.formId;

  setPublishMode(publishMode: PublishMode, formId: number, eavService: FormConfigService): void {
    // if publish mode is prohibited, set default
    if (eavService.config.versioningOptions[publishMode] == null) {
      publishMode = Object.keys(eavService.config.versioningOptions)[0] as PublishMode;
    }
    const publishStatus: PublishStatus = {
      formId,
      DraftShouldBranch: publishMode === PublishModes.Branch,
      IsPublished: publishMode === PublishModes.Show,
    };
    this.add(publishStatus);
  }

  getPublishMode(formId: number): Signal<PublishMode> {
    return this.#signalsPublishModeCache.getOrCreate(formId, () => this.toPublishMode(this.get(formId)));
  }
  #signalsPublishModeCache = new ComputedCacheHelper<number, PublishMode>('publishMode');

  
  /** Convert the booleans to the appropriate "verb" */
  public toPublishMode(publishStatus: EavPublishStatus): PublishMode {
    const publishMode: PublishMode = publishStatus.DraftShouldBranch
      ? PublishModes.Branch
      : publishStatus.IsPublished
        ? PublishModes.Show
        : PublishModes.Hide;
    return publishMode;
  }

}
