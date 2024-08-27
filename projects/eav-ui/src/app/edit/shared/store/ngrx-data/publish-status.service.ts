import { computed, Injectable, signal, Signal } from '@angular/core';
import { FormConfigService } from '../../../state/form-config.service';
import { PublishStatus, PublishMode, PublishModes, EavPublishStatus } from '../../../dialog/main/edit-dialog-main.models';
import { ComputedCacheHelper } from 'projects/eav-ui/src/app/shared/helpers/computed-cache';

@Injectable({ providedIn: 'root' })
export class PublishStatusService /* extends BaseDataService<PublishStatus> TODO:: Old Code */ {
  private publishStatusSig = signal<Record<number, PublishStatus>>({});

  // TODO::: Old Code remove after testing ist done
  // constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
  //   super('PublishStatus', serviceElementsFactory);
  // }

  //#region Add / Clear Cache

  private addToCache(publishStatus: PublishStatus[]): void {
    // TODO:: Old Code, remove after testing ist done
    // this.upsertManyInCache(contentTypeItems);

    const updatedStatus = { ...this.publishStatusSig() };

    publishStatus.forEach(status => {
      updatedStatus[status.formId] = status;
    });

    // Signal mit dem neuen Status aktualisieren
    this.publishStatusSig.set(updatedStatus);
  }

  private setPublishStatus(publishStatus: PublishStatus): void {
    // console.log('@2dg setPublish before', this.publishStatusSig());
    this.addToCache([publishStatus]);
    // console.log('@2dg setPublish after', this.publishStatusSig());
  }

  public removePublishStatus(formId: number): void {
    this.publishStatusSig.update(currentStatus => {
      const { [formId]: _, ...updatedStatus } = currentStatus;
      return updatedStatus;
    });
    // TODO::: Old Code remove after testing ist done
    // this.removeOneFromCache(formId);
  }

  public clearCache(): void {
    this.publishStatusSig = signal<Record<number, PublishStatus>>({});
  }

  //#endregion

  //#region Add using Verbs (PublishMode)

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

  //#endregion

  //#region Getters

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
    return this.#signalsPublishModeCache.getOrCreate(formId, () => this.toPublishMode(this.getPublishStatus(formId)));
    // const cached = this.signalsPublishModeCache[formId];
    // if (cached) return cached;
    // const sig = computed(() => this.toPublishMode(this.getPublishStatus(formId)));
    // return this.signalsPublishModeCache[formId] = sig;
  }
  // private signalsPublishModeCache: Record<number, Signal<PublishMode>> = {};
  #signalsPublishModeCache = new ComputedCacheHelper<number, PublishMode>();

  //#endregion

  //#region Conversions

  /** Convert the booleans to the appropriate "verb" */
  public toPublishMode(publishStatus: EavPublishStatus): PublishMode {
    const publishMode: PublishMode = publishStatus.DraftShouldBranch
      ? PublishModes.Branch
      : publishStatus.IsPublished
        ? PublishModes.Show
        : PublishModes.Hide;
    return publishMode;
  }

  //#endregion

}
