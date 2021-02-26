import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { PublishMode, PublishModeConstants, PublishStatus } from '../../models';
import { EavService } from '../../services';

@Injectable({ providedIn: 'root' })
export class PublishStatusService extends EntityCollectionServiceBase<PublishStatus> {
  private publishStatuses$: BehaviorSubject<PublishStatus[]>;

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('PublishStatus', serviceElementsFactory);

    this.publishStatuses$ = new BehaviorSubject<PublishStatus[]>([]);
    // doesn't need to be completed because store services are singletons that lives as long as the browser tab is open
    this.entities$.subscribe(publishStatuses => {
      this.publishStatuses$.next(publishStatuses);
    });
  }

  setPublishStatus(publishStatus: PublishStatus): void {
    this.upsertOneInCache(publishStatus);
  }

  removePublishStatus(formId: number): void {
    this.removeOneFromCache(formId);
  }

  getPublishStatus(formId: number): PublishStatus {
    const publishStatus = this.publishStatuses$.value.find(status => status.formId === formId);
    return publishStatus;
  }

  private getPublishStatus$(formId: number): Observable<PublishStatus> {
    return this.publishStatuses$.pipe(
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
