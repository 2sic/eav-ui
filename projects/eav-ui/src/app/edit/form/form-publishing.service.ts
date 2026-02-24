import { Injectable, Signal } from '@angular/core';
import { Of } from '../../../../../core';
import { classLog } from '../../../../../shared/logging';
import { ComputedCacheHelper } from '../../shared/signals/computed-cache';
import { EavPublishStatus, PublishModes, PublishStatus } from '../dialog/main/edit-dialog-main.models';
import { SignalStoreBase } from '../shared/store/signal-store-base';
import { FormConfigService } from './form-config.service';

@Injectable({ providedIn: 'root' })
export class FormPublishingService extends SignalStoreBase<number, PublishStatus> {
  
  constructor() {
    super(classLog({FormPublishingService}));
  }

  override getId = (item: PublishStatus) => item.formId;

  setPublishMode(publishMode: Of<typeof PublishModes>, formId: number, eavService: FormConfigService): void {
    // if publish mode is prohibited, set default
    if (eavService.config.versioningOptions[publishMode] == null) {
      publishMode = Object.keys(eavService.config.versioningOptions)[0] as Of<typeof PublishModes>;
    }
    const publishStatus: PublishStatus = {
      formId,
      DraftShouldBranch: publishMode === PublishModes.Branch,
      IsPublished: publishMode === PublishModes.Show,
    };
    this.add(publishStatus);
  }

  getPublishMode(formId: number): Signal<Of<typeof PublishModes>> {
    return this.#signalsPublishModeCache.getOrCreate(formId, () => this.toPublishMode(this.get(formId)));
  }
  #signalsPublishModeCache = new ComputedCacheHelper<number, Of<typeof PublishModes>>('publishMode');

  
  /** Convert the booleans to the appropriate "verb" */
  public toPublishMode(publishStatus: EavPublishStatus): Of<typeof PublishModes> {
    const publishMode: Of<typeof PublishModes> = publishStatus.DraftShouldBranch
      ? PublishModes.Branch
      : publishStatus.IsPublished
        ? PublishModes.Show
        : PublishModes.Hide;
    return publishMode;
  }

}
