import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { PublishMode, PublishModeConstants, PublishStatus } from '../../models';
import { EavService } from '../../services';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class PublishStatusService extends BaseDataService<PublishStatus> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('PublishStatus', serviceElementsFactory);
  }

  setPublishStatus(publishStatus: PublishStatus): void {
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

  setPublishMode(publishMode: PublishMode, formId: number, eavService: EavService): void {
    // if publish mode is prohibited, set default
    if (eavService.eavConfig.versioningOptions[publishMode] == null) {
      publishMode = Object.keys(eavService.eavConfig.versioningOptions)[0] as PublishMode;
    }
    const publishStatus: PublishStatus = {
      formId,
      DraftShouldBranch: publishMode === PublishModeConstants.Branch,
      IsPublished: publishMode === PublishModeConstants.Show,
    };
    this.setPublishStatus(publishStatus);
  }

  getPublishMode$(formId: number): Observable<PublishMode> {
    return this.getPublishStatus$(formId).pipe(
      map(publishStatus => {
        const publishMode: PublishMode = publishStatus.DraftShouldBranch
          ? PublishModeConstants.Branch
          : publishStatus.IsPublished ? PublishModeConstants.Show : PublishModeConstants.Hide;
        return publishMode;
      }),
    );
  }
}
