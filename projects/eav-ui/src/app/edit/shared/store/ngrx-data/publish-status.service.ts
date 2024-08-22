import { Injectable, Signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { mapUntilObjChanged } from '../../../../shared/rxJs/mapUntilChanged';
import { FormConfigService } from '../../../state/form-config.service';
import { PublishStatus, PublishMode, PublishModes } from '../../../dialog/main/edit-dialog-main.models';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class PublishStatusService /* extends BaseDataService<PublishStatus> TODO:: Old Code */ {

  publishStatus: Record<number, PublishStatus> = {};

  // TODO::: Old Code remove after testing ist done
  // constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
  //   super('PublishStatus', serviceElementsFactory);
  // }

  private setPublishStatus(publishStatus: PublishStatus): void {
    this.addToCache([publishStatus]);
  }

  removePublishStatus(formId: number): void {
    this.publishStatus[formId] = null; // delete this.publishStatus[formId];

    // TODO::: Old Code remove after testing ist done
    // this.removeOneFromCache(formId);
  }

  getPublishStatus(formId: number): PublishStatus {
    return this.publishStatus[formId];
    // TODO::: Old Code remove after testing ist done
    // return this.cache().find(publishStatus => publishStatus.formId === formId);
  }

  private getPublishStatus$(formId: number): Observable<PublishStatus> {
    return of(this.publishStatus[formId]);
    // TODO::: Old Code remove after testing ist done
    // return this.cache$.pipe(
    //   mapUntilObjChanged(publishStatuses => publishStatuses.find(publishStatus => publishStatus.formId === formId)),
    // );
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

  getPublishModeSignal(formId: number): Signal<PublishMode> {
    const cached = this.signalsPublishModeCache[formId];
    if (cached) return cached;
    var obs = this.getPublishMode$(formId);
    return this.signalsPublishModeCache[formId] = toSignal(obs); // note: no initial value, it should always be up-to-date
  }
  private signalsPublishModeCache: Record<number, Signal<PublishMode>> = {};


  private addToCache(publishStatus: PublishStatus[]): void {
    // TODO:: Old Code, remove after testing ist done
    // this.upsertManyInCache(contentTypeItems);

    publishStatus.forEach(status => {
      this.publishStatus[status.formId] = status;
    });
  }

  public clearCache(): void {
    this.publishStatus = {};
  }


}
