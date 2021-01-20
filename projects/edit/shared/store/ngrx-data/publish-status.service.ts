import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, take } from 'rxjs/operators';
import { EavService } from '../..';
import { PublishMode, PublishModeConstants, PublishStatus } from '../../models';

@Injectable({ providedIn: 'root' })
export class PublishStatusService extends EntityCollectionServiceBase<PublishStatus> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('PublishStatus', serviceElementsFactory);
  }

  public setPublishStatus(publishStatus: PublishStatus): void {
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
    this.setPublishStatus(publishStatus);
  }

  private getPublishStatus$(formId: number): Observable<PublishStatus> {
    return this.entities$.pipe(
      map(publishStatuses => publishStatuses.find(publishStatus => publishStatus.formId === formId)),
      distinctUntilChanged(),
    );
  }

  public getPublishMode$(formId: number): Observable<PublishMode> {
    return this.getPublishStatus$(formId).pipe(
      map(publishStatus => {
        const publishMode: PublishMode = publishStatus.DraftShouldBranch
          ? PublishModeConstants.Branch
          : publishStatus.IsPublished ? PublishModeConstants.Show : PublishModeConstants.Hide;
        return publishMode;
      }),
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
