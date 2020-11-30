import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, take } from 'rxjs/operators';
import { EavService } from '../..';
import { PublishMode, PublishModeConstants } from '../../models/eav/publish-mode.models';
import { PublishStatus } from '../../models/eav/publish-status';

@Injectable({ providedIn: 'root' })
export class PublishStatusService extends EntityCollectionServiceBase<PublishStatus> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('PublishStatus', serviceElementsFactory);
  }

  public loadPublishStatus(publishStatus: PublishStatus): void {
    this.upsertOneInCache(publishStatus);
  }

  public setPublishMode(publishMode: PublishMode, formId: number, eavService: EavService): void {
    // if publish mode is prohibited, revert to default
    if (eavService.eavConfig.versioningOptions[publishMode] == null) {
      publishMode = Object.keys(eavService.eavConfig.versioningOptions)[0] as PublishMode;
    }
    const publishStatus: PublishStatus = {
      formId,
      DraftShouldBranch: publishMode === PublishModeConstants.Branch,
      IsPublished: publishMode === PublishModeConstants.Show,
    };
    this.upsertOneInCache(publishStatus);
  }

  public getPublishMode$(formId: number): Observable<PublishMode> {
    return this.entities$.pipe(
      map(publishStatuses => publishStatuses.find(publishStatus => publishStatus.formId === formId)),
      distinctUntilChanged(),
      map(publishStatus => {
        const publishMode: PublishMode = publishStatus.DraftShouldBranch
          ? PublishModeConstants.Branch
          : publishStatus.IsPublished ? PublishModeConstants.Show : PublishModeConstants.Hide;
        return publishMode;
      }),
      distinctUntilChanged(),
    );
  }

  public getPublishStatus(formId: number): PublishStatus {
    let publishStatus: PublishStatus;
    this.entities$.pipe(
      map(publishStatuses => publishStatuses.find(status => status.formId === formId)),
      take(1),
    ).subscribe(status => {
      publishStatus = status;
    });
    return publishStatus;
  }

  public removePublishStatus(formId: number): void {
    this.removeOneFromCache(formId);
  }
}
