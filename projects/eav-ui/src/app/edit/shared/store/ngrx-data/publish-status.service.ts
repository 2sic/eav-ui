import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { PublishMode, PublishModes, PublishStatus } from '../../models';
import { EavService } from '../../services';
import { BaseDataService } from './base-data.service';

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
    return this.cache$.value.find(publishStatus => publishStatus.formId === formId);
  }

  private getPublishStatus$(formId: number): Observable<PublishStatus> {
    return this.cache$.pipe(
      map(publishStatuses => publishStatuses.find(publishStatus => publishStatus.formId === formId)),
      distinctUntilChanged(),
    );
  }

  /** Convert the booleans to the appropriate "verb" */
  asPublishMode(isPublished: boolean, draftShouldBranch: boolean): PublishMode {
    return draftShouldBranch ? PublishModes.Branch : isPublished ? PublishModes.Show : PublishModes.Hide;
  }

  setPublishMode(publishMode: PublishMode, formId: number, eavService: EavService): void {
    // if publish mode is prohibited, set default
    if (eavService.eavConfig.versioningOptions[publishMode] == null) {
      publishMode = Object.keys(eavService.eavConfig.versioningOptions)[0] as PublishMode;
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
      map(publishStatus => {
        const publishMode: PublishMode = publishStatus.DraftShouldBranch
          ? PublishModes.Branch
          : publishStatus.IsPublished ? PublishModes.Show : PublishModes.Hide;
        return publishMode;
      }),
    );
  }
}
