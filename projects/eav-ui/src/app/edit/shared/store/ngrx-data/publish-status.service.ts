import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable } from 'rxjs';
import { PublishMode, PublishModes, PublishStatus } from '../../models';
import { FormConfigService } from '../../services';
import { BaseDataService } from './base-data.service';
import { mapUntilObjChanged } from '../../../../shared/rxJs/mapUntilChanged';

@Injectable({ providedIn: 'root' })
export class PublishStatusService extends BaseDataService<PublishStatus> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('PublishStatus', serviceElementsFactory);
  }

  private setPublishStatus(publishStatus: PublishStatus): void {
    this.upsertOneInCache(publishStatus);
  }

  removePublishStatus(formId: number): void {
    this.removeOneFromCache(formId);
  }

  getPublishStatus(formId: number): PublishStatus {
    return this.cache().find(publishStatus => publishStatus.formId === formId);
  }

  private getPublishStatus$(formId: number): Observable<PublishStatus> {
    return this.cache$.pipe(
      mapUntilObjChanged(publishStatuses => publishStatuses.find(publishStatus => publishStatus.formId === formId)),
    );
  }

  /** Convert the booleans to the appropriate "verb" */
  asPublishMode(isPublished: boolean, draftShouldBranch: boolean): PublishMode {
    return draftShouldBranch ? PublishModes.Branch : isPublished ? PublishModes.Show : PublishModes.Hide;
  }

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
    this.setPublishStatus(publishStatus);
  }

  getPublishMode$(formId: number): Observable<PublishMode> {
    return this.getPublishStatus$(formId).pipe(
      mapUntilObjChanged(publishStatus => {
        const publishMode: PublishMode = publishStatus.DraftShouldBranch
          ? PublishModes.Branch
          : publishStatus.IsPublished ? PublishModes.Show : PublishModes.Hide;
        return publishMode;
      }),
    );
  }
}
