import { computed, Injectable, signal, Signal } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { map, Observable } from 'rxjs';
import { eavConstants } from '../../../../shared/constants/eav.constants';
import { EavEntity, EavEntityAttributes, EavFor, EavItem } from '../../models/eav';
import { EavEntityBundleDto } from '../../models/json-format-v1';
import { BaseDataService } from './base-data.service';
import { ItemIdentifierHeader } from '../../../../shared/models/edit-form.model';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { RxHelpers } from '../../../../shared/rxJs/rx.helpers';
import { mapUntilChanged, mapUntilObjChanged } from '../../../../shared/rxJs/mapUntilChanged';
import { toSignal } from '@angular/core/rxjs-interop';
import { ItemUpdateHelper } from './item-updater.helper';

const logThis = false;
const nameOfThis = 'ItemService';

@Injectable({ providedIn: 'root' })
export class ItemService extends BaseDataService<EavItem> {
  log = new EavLogger(nameOfThis, logThis);

  private itemsSig = signal<Record<string, EavItem>>({});

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Item', serviceElementsFactory);
  }

  public updater = new ItemUpdateHelper(this);

  loadItems(dtoItems: EavEntityBundleDto[]): void {
    const items = dtoItems.map(item => EavItem.convert(item));

    this.upsertManyInCache(items);

    // NEW CODE 2dg
    items.forEach(item => this.itemsSig.set({ ...this.itemsSig(), [item.Entity.Id]: item }));
  }

  updateItem(item: EavItem): void {
    this.itemsSig.set({ ...this.itemsSig(), [item.Entity.Guid]: item });

    // TODO: @2dg - we can't remove this yet because there is a lot of code
    // using cache() or cache$ directly!
    this.updateOneInCache(item);
  }


  // TODO:: Old Code, remove after testing ist done
  updateItemHeader(entityGuid: string, header: ItemIdentifierHeader): void {
    const l = this.log.fn('updateItemHeader', { entityGuid, header });
    const oldItem = this.getItem(entityGuid);
    if (!oldItem) return;

    const newItem: EavItem = {
      ...oldItem,
      Header: {
        ...header
      }
    };
    this.updateItem(newItem);
    l.end();
  }

  getItem(entityGuid: string): EavItem {
    return this.cache().find(item => item.Entity.Guid === entityGuid);
  }

  item(entityGuid: string): Signal<EavItem> {
    // try cached signal first
    return this.#itemCache[entityGuid]
      ? this.#itemCache[entityGuid]
      : this.#itemCache[entityGuid] = computed(
        // () => this.itemsSig()[entityGuid], // TODO:: New Code not working
        () => this.getItem(entityGuid), // TODO:: OLD CODE remove after testing ist done
        { equal: RxHelpers.objectsEqual },
      );
  }
  #itemCache: Record<string, Signal<EavItem>> = {};

  // TODO:: new Signal for getHeader

  itemAttributes(entityGuid: string): Signal<EavEntityAttributes> {
    const l = this.log.fn('itemAttributes', { entityGuid });
    // try cached signal first
    return this.#itemAttributesCache[entityGuid]
      ? l.r(this.#itemAttributesCache[entityGuid], 'cached')
      : this.#itemAttributesCache[entityGuid] = computed(
        () => this.item(entityGuid)()?.Entity.Attributes,
        { equal: RxHelpers.objectsEqual },
      );
  }
  #itemAttributesCache: Record<string, Signal<EavEntityAttributes>> = {};

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

  getItemAttributesSignal(entityGuid: string): Signal<EavEntityAttributes> {
    // TODO:: New Code not working
    // return computed(() => this.itemsSig()[entityGuid]?.Entity.Attributes);

    // TODO:: OLD CODE remove after testing ist done
    return computed(() => this.getItem(entityGuid)?.Entity.Attributes);

  }

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

  getItemHeaderSig(entityGuid: string): Signal<ItemIdentifierHeader> {
    const sig = computed(() => {
      const item = this.getItem(entityGuid);
      return item?.Header;
    });
    return sig
  }

  slotIsEmpty(entityGuid: string): Signal<boolean> {
    // prepare signal before creating computed so it doesn't get recreated
    const itemHeader = this.item(entityGuid);
    return computed(() => {
      const header = itemHeader()?.Header;
      return header == null ? true : header.IsEmptyAllowed && header.IsEmpty;
    });
  }

  getItems(entityGuids?: string[]): EavItem[] {
    if (entityGuids == null) {
      return Object.values(this.itemsSig()) as EavItem[];
    }

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
      // distinctUntilChanged(RxHelpers.arraysEqual),
    );
  }

  getItemsSignal(entityGuids?: string[]): Signal<EavItem[]> {
    // Convert the array to a string key, or use an empty string if entityGuids is undefined
    const key = entityGuids ? entityGuids.join(',') : '';

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

}
