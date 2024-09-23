import { Injectable, Signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { eavConstants } from '../../shared/constants/eav.constants';
import { EavEntity, EavFor, EavItem } from '../shared/models/eav';
import { EavEntityBundleDto } from '../shared/models/json-format-v1';
import { ItemIdentifierHeader } from '../../shared/models/edit-form.model';
import { mapUntilChanged, mapUntilObjChanged } from '../../shared/rxJs/mapUntilChanged';
import { ItemUpdateHelper } from './item-updater.helper';
import { ComputedCacheHelper } from '../../shared/signals/computed-cache';
import { EavEntityAttributes } from '../shared/models/eav/eav-entity-attributes';
import { SignalStoreObservableBase } from '../shared/store/signal-store-observable-base';
import { classLog } from '../../shared/logging';

/**
 * This class provides access to the items / entities cache which are being edited in the UI.
 * 
 * It's undergoing a lot of refactoring to get rid of observables, so ATM it's a bit confusing.
 */
@Injectable({ providedIn: 'root' })
export class ItemService extends SignalStoreObservableBase<string, EavItem> {

  constructor() {
    super(classLog({ItemService}));
  }

  override getId = (item: EavItem) => item.Entity.Guid;

  public updater = new ItemUpdateHelper(this);

  //#region Loaders and Updaters

  loadItems(dtoItems: EavEntityBundleDto[]): void {
    const items = dtoItems.map(item => EavItem.convert(item));
    this.addMany(items);
  }

  //#endregion

  //#region Item Attributes

  itemAttributesSignal(entityGuid: string): Signal<EavEntityAttributes> {
    const l = this.log.fn('itemAttributes', { entityGuid });
    const result = this.#itemAttributesCache.getOrCreate(entityGuid, () => this.getSignal(entityGuid)()?.Entity.Attributes);
    return l.r(result);
  }
  #itemAttributesCache = new ComputedCacheHelper<string, EavEntityAttributes>('itemAttributes');

  getItemAttributes(entityGuid: string): EavEntityAttributes {
    const l = this.log.fn('getItemAttributes', { entityGuid });
    const result = this.get(entityGuid)?.Entity.Attributes;
    return l.r(result);
  }

  getItemAttributes$(entityGuid: string): Observable<EavEntityAttributes> {
    return this.list$.pipe(
      map(items => items.find(item => item.Entity.Guid === entityGuid)?.Entity.Attributes),
      mapUntilChanged(m => m),
    );
  }

  //#endregion

  //#region Item Headers

  getItemHeader(entityGuid: string): ItemIdentifierHeader {
    return this.get(entityGuid)?.Header;
  };

  getItemHeader$(entityGuid: string): Observable<ItemIdentifierHeader> {
    return this.list$.pipe(
      map(items => items.find(item => item.Entity.Guid === entityGuid)?.Header),
      mapUntilObjChanged(m => m),
    );
  }

  getItemHeaderSignal(entityGuid: string): Signal<ItemIdentifierHeader> {
    return this.#itemHeaderCache.getOrCreate(entityGuid, () => this.getSignal(entityGuid)()?.Header);
  }
  #itemHeaderCache = new ComputedCacheHelper<string, ItemIdentifierHeader>('itemHeader');

  //#endregion

  //#region Item Header Properties

  slotIsEmpty(entityGuid: string): Signal<boolean> {
    return this.#slotIsEmptyCache.getOrCreate(entityGuid, () => {
      const header = this.getSignal(entityGuid)()?.Header;
      return header == null ? true : header.IsEmptyAllowed && header.IsEmpty;
    });
  }
  #slotIsEmptyCache = new ComputedCacheHelper<string, boolean>('slotIsEmpty');

  //#endregion

  //#region Item Metadata & For (Metadata Target)

  /** Sync get-item-for info to show metadata-target info on an entity in the UI */
  getItemFor(entityGuid: string): EavFor {
    return this.get(entityGuid)?.Entity.For;
  }


  getItemNote(entityGuid: string): EavEntity | undefined {
    return this.get(entityGuid)?.Entity.Metadata
      ?.find(metadata => metadata.Type.Name === eavConstants.contentTypes.notes);
  }

  //#endregion

}
