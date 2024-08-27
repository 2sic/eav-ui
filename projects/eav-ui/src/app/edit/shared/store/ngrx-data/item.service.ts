import { Injectable, signal, Signal } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { map, Observable } from 'rxjs';
import { eavConstants } from '../../../../shared/constants/eav.constants';
import { EavEntity, EavFor, EavItem } from '../../models/eav';
import { EavEntityBundleDto } from '../../models/json-format-v1';
import { BaseDataService } from './base-data.service';
import { ItemIdentifierHeader } from '../../../../shared/models/edit-form.model';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { mapUntilChanged, mapUntilObjChanged } from '../../../../shared/rxJs/mapUntilChanged';
import { toSignal } from '@angular/core/rxjs-interop';
import { ItemUpdateHelper } from './item-updater.helper';
import { ComputedCacheHelper } from '../../../../../../../eav-ui/src/app/shared/helpers/computed-cache';
import { EavEntityAttributes } from '../../models/eav/eav-entity-attributes';

const logThis = false;
const nameOfThis = 'ItemService';

/**
 * This class provides access to the items / entities cache which are being edited in the UI.
 * 
 * It's undergoing a lot of refactoring to get rid of observables, so ATM it's a bit confusing.
 */
@Injectable({ providedIn: 'root' })
export class ItemService extends BaseDataService<EavItem> {
  log = new EavLogger(nameOfThis, logThis);

  private itemsSig = signal<Record<string, EavItem>>({});

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Item', serviceElementsFactory);
  }

  public updater = new ItemUpdateHelper(this);

  //#region Loaders and Updaters

  loadItems(dtoItems: EavEntityBundleDto[]): void {
    const items = dtoItems.map(item => EavItem.convert(item));

    this.upsertManyInCache(items);

    // also add to signal, but in one go
    let before = this.itemsSig();
    items.forEach(item => before = { ...before, [item.Entity.Id]: item });
    this.itemsSig.set(before);
  }

  updateItem(item: EavItem): void {
    // temporary signal - @2dgs idea, not sure if this is stable/useful
    this.itemsSig.set({ ...this.itemsSig(), [item.Entity.Guid]: item });

    // TODO: @2dg - we can't remove this yet because there is a lot of code
    // using cache() or cache$ directly!
    this.updateOneInCache(item);
  }

  //#endregion

  //#region Item Getters

  getItem(entityGuid: string): EavItem {
    return this.cache().find(item => item.Entity.Guid === entityGuid);
  }

  itemSignal(entityGuid: string): Signal<EavItem> {
    return this.#itemCache.getOrCreate(entityGuid, () => this.getItem(entityGuid));
  }
  #itemCache = new ComputedCacheHelper<string, EavItem>();

  //#endregion

  //#region Items Getters

  getItems(entityGuids?: string[]): EavItem[] {
    if (entityGuids == null)
      return Object.values(this.itemsSig()) as EavItem[];

    return Object.values(this.itemsSig())
      .filter(item => entityGuids.includes(item.Entity.Guid));

    // TODO:: OLD CODE remove after testing ist done
    // if (entityGuids == null) { return this.cache(); }
    // return this.cache().filter(item => entityGuids.includes(item.Entity.Guid));
  }


  getItems$(entityGuids?: string[]): Observable<EavItem[]> {
    if (entityGuids == null) { return this.cache$.asObservable(); }

    return this.cache$.pipe(
      map(items => items.filter(item => entityGuids.includes(item.Entity.Guid))),
      mapUntilObjChanged(m => m),
    );
  }

  getItemsSignal(entityGuids?: string[]): Signal<EavItem[]> {
    // Convert the array to a string key, or use an empty string if entityGuids is undefined
    const key = entityGuids?.length > 0
      ? entityGuids.sort().join(',')
      : 'null-all';

    const cached = this.signalsItemsCache[key];
    if (cached) return cached;

    // TODO:: New Code not working
    // const sig = computed(() => {
    //   const items = Object.values(this.itemsSig());
    //   return items.filter(item => entityGuids.includes(item.Entity.Guid));
    // });
    // return this.signalsItemsCache[key] = sig;

    // TODO:: OLD CODE remove after testing ist done
    const obs = this.getItems$(entityGuids);
    return this.signalsItemsCache[key] = toSignal(obs);
  }
  private signalsItemsCache: Record<string, Signal<EavItem[]>> = {};
  // #signalsItemsCache = new ComputedCacheHelper<string, EavItem[]>();

  //#endregion

  // TODO:: new Signal for getHeader

  //#region Item Attributes

  itemAttributesSignal(entityGuid: string): Signal<EavEntityAttributes> {
    const l = this.log.fn('itemAttributes', { entityGuid });
    // try cached signal first
    return this.#itemAttributesCache.getOrCreate(entityGuid, () => this.itemSignal(entityGuid)()?.Entity.Attributes);
  }
  #itemAttributesCache = new ComputedCacheHelper<string, EavEntityAttributes>();

  getItemAttributes(entityGuid: string): EavEntityAttributes {
    const l = this.log.fn('getItemAttributes', { entityGuid });

    // TODO:: New Code not working
    // const result = this.itemsSig()[entityGuid]?.Entity.Attributes;

    // TODO:: OLD CODE remove after testing ist done
    const result = this.getItem(entityGuid)?.Entity.Attributes;
    return l.r(result);
  }

  getItemAttributes$(entityGuid: string): Observable<EavEntityAttributes> {
    return this.cache$.pipe(
      map(items => items.find(item => item.Entity.Guid === entityGuid)?.Entity.Attributes),
      mapUntilChanged(m => m),
    );
  }

  //#endregion

  //#region Item Headers

  getItemHeader(entityGuid: string): ItemIdentifierHeader {
    // TODO:: New Code not working
    // return this.itemsSig()[entityGuid]?.Header;

    // TODO:: OLD CODE remove after testing ist done
    return this.getItem(entityGuid)?.Header;
  };

  getItemHeader$(entityGuid: string): Observable<ItemIdentifierHeader> {
    return this.cache$.pipe(
      map(items => items.find(item => item.Entity.Guid === entityGuid)?.Header),
      mapUntilObjChanged(m => m),
    );
  }

  getItemHeaderSignal(entityGuid: string): Signal<ItemIdentifierHeader> {
    return this.#itemHeaderCache.getOrCreate(entityGuid, () => this.getItem(entityGuid)?.Header);
  }
  #itemHeaderCache = new ComputedCacheHelper<string, ItemIdentifierHeader>();

  //#endregion

  //#region Item Header Properties

  slotIsEmpty(entityGuid: string): Signal<boolean> {
    return this.#slotIsEmptyCache.getOrCreate(entityGuid, () => {
      const header = this.itemSignal(entityGuid)()?.Header;
      return header == null ? true : header.IsEmptyAllowed && header.IsEmpty;
    });
  }
  #slotIsEmptyCache = new ComputedCacheHelper<string, boolean>();

  //#endregion

  //#region Item Metadata & For (Metadata Target)

  /** Sync get-item-for info to show metadata-target info on an entity in the UI */
  getItemFor(entityGuid: string): EavFor {
    // TODO:: New Code not working
    // return this.itemsSig()[entityGuid]?.Entity.For;

    // TODO:: OLD CODE remove after testing ist done
    return this.getItem(entityGuid)?.Entity.For;
  }


  getItemNote(entityGuid: string): EavEntity | undefined {
    // TODO:: New Code not working
    // const entity = this.itemsSig()[entityGuid];
    // // Check whether the entity exists and whether metadata is present
    // if (entity && entity.Entity && entity.Entity.Metadata) {
    //   // Finds the metadata of the desired type
    //   return entity.Entity.Metadata.find(metadata => metadata.Type.Name === eavConstants.contentTypes.notes);
    // }
    // console.error(`Entity with GUID ${entityGuid} not found or invalid`);
    // return undefined;

    // TODO:: OLD CODE remove after testing ist done
    return this.getItem(entityGuid)?.Entity.Metadata
      ?.find(metadata => metadata.Type.Name === eavConstants.contentTypes.notes);
  }

  //#endregion

}
