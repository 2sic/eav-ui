import { computed, Injectable, signal, Signal } from '@angular/core';
import { FormConfigService } from '../../../state/form-config.service';
import { PublishStatus, PublishMode, PublishModes } from '../../../dialog/main/edit-dialog-main.models';

@Injectable({ providedIn: 'root' })
export class PublishStatusService /* extends BaseDataService<PublishStatus> TODO:: Old Code */ {
  private publishStatusSig = signal<Record<number, PublishStatus>>({});

  // TODO::: Old Code remove after testing ist done
  // constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
  //   super('PublishStatus', serviceElementsFactory);
  // }

  private setPublishStatus(publishStatus: PublishStatus): void {
    // console.log('@2dg setPublish before', this.publishStatusSig());
    this.addToCache([publishStatus]);
    // console.log('@2dg setPublish after', this.publishStatusSig());
  }

  removePublishStatus(formId: number): void {
    this.publishStatusSig.update(currentStatus => {
      const { [formId]: _, ...updatedStatus } = currentStatus;
      return updatedStatus;
    });
    // TODO::: Old Code remove after testing ist done
    // this.removeOneFromCache(formId);
  }

  getPublishStatus(formId: number): PublishStatus {
    return this.publishStatusSig()[formId];

    // TODO::: Old Code remove after testing ist done
    // return this.cache().find(publishStatus => publishStatus.formId === formId);
  }

  // getPublishModeX(formId: number): PublishMode {
  //   return this.convertToPublishMode(this.getPublishStatus(formId));
  // }

  // private getPublishStatus$(formId: number): Observable<PublishStatus> {
  //   return of(this.publishStatusSig()[formId]);
  //   //
  //   // TODO::: Old Code remove after testing ist done
  //   // return this.cache$.pipe(
  //   //   mapUntilObjChanged(publishStatuses => publishStatuses.find(publishStatus => publishStatus.formId === formId)),
  //   // );
  // }

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

  // TODO:: Not in Used, 2dg Old Code, remove after testing ist done
  // private getPublishMode$(formId: number): Observable<PublishMode> {
  //   console.log('@2dg getPublishMode', formId);
  //   return this.getPublishStatus$(formId).pipe(
  //     mapUntilObjChanged(
  //       publishStatus => this.convertToPublishMode(publishStatus),
  //     ),
  //   );
  // }

  getPublishMode(formId: number): Signal<PublishMode> {
    // console.log('@2dg getPublishModeSignal', formId);
    const cached = this.signalsPublishModeCache[formId];
    if (cached) return cached;
    const sig = computed(() => this.convertToPublishMode(this.getPublishStatus(formId)));
    return this.signalsPublishModeCache[formId] = sig;
  }
  private signalsPublishModeCache: Record<number, Signal<PublishMode>> = {};

  private addToCache(publishStatus: PublishStatus[]): void {
    // TODO:: Old Code, remove after testing ist done
    // this.upsertManyInCache(contentTypeItems);

    const currentStatus = this.publishStatusSig();

    const updatedStatus = { ...currentStatus };

    publishStatus.forEach(status => {
      updatedStatus[status.formId] = status;
    });

    // Signal mit dem neuen Status aktualisieren
    this.publishStatusSig.set(updatedStatus);

  }

  public clearCache(): void {
    this.publishStatusSig = signal<Record<number, PublishStatus>>({});
  }

  private convertToPublishMode(publishStatus: PublishStatus): PublishMode {
    const publishMode: PublishMode = publishStatus.DraftShouldBranch
      ? PublishModes.Branch
      : publishStatus.IsPublished ? PublishModes.Show : PublishModes.Hide;
    return publishMode;
  }

}
