import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map, share } from 'rxjs/operators';
import { EavService } from '.';
import { FieldSettings } from '../../../edit-types';
import { FieldLogicManager } from '../../field-logic/field-logic-manager';
import { InputFieldHelper } from '../helpers/input-field-helper';
import { LocalizationHelper } from '../helpers/localization-helper';
import { ContentTypeSettings } from '../models';
import { EavContentType, EavEntity, EavItem } from '../models/eav';
import { ContentTypeService } from '../store/ngrx-data/content-type.service';
import { ItemService } from '../store/ngrx-data/item.service';
import { LanguageInstanceService } from '../store/ngrx-data/language-instance.service';

@Injectable()
export class FieldsSettings2Service implements OnDestroy {
  private contentTypeSettings$: BehaviorSubject<ContentTypeSettings>;
  private fieldsSettings$: BehaviorSubject<FieldSettings[]>;
  private subscription: Subscription;

  constructor(
    private contentTypeService: ContentTypeService,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
    private itemService: ItemService,
  ) { }

  public ngOnDestroy(): void {
    this.contentTypeSettings$?.complete();
    this.fieldsSettings$?.complete();
    this.subscription?.unsubscribe();
  }

  public init(item: EavItem): void {
    this.subscription = new Subscription();
    this.contentTypeSettings$ = new BehaviorSubject<ContentTypeSettings>(null);
    this.fieldsSettings$ = new BehaviorSubject<FieldSettings[]>([]);

    const contentTypeId = InputFieldHelper.getContentTypeId(item);
    const contentType$ = this.contentTypeService.getContentTypeById(contentTypeId);
    const header$ = this.itemService.selectItemHeader(item.Entity.Guid);
    const formId = this.eavService.eavConfig.formId;
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage(formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(formId);

    this.subscription.add(
      combineLatest([contentType$, header$, currentLanguage$, defaultLanguage$]).pipe(
        map(([contentType, header, currentLanguage, defaultLanguage]) => {
          const ctSettings = this.mergeSettings<ContentTypeSettings>(contentType.Metadata, currentLanguage, defaultLanguage);
          ctSettings.Description ??= '';
          ctSettings.EditInstructions ??= '';
          ctSettings.Label ??= '';
          ctSettings.ListInstructions ??= '';
          ctSettings.Notes ??= '';
          ctSettings.Icon ??= '';
          ctSettings.Link ??= '';
          ctSettings._itemTitle = this.getContentTypeTitle(contentType, currentLanguage, defaultLanguage);
          ctSettings._slotCanBeEmpty = header?.Group?.SlotCanBeEmpty ?? false;
          ctSettings._slotIsEmpty = header?.Group?.SlotIsEmpty ?? false;
          return ctSettings;
        }),
      ).subscribe(ctSettings => {
        this.contentTypeSettings$.next(ctSettings);
      })
    );

    const itemAttributes$ = this.itemService.selectItemAttributes(item.Entity.Guid);
    this.subscription.add(
      combineLatest([contentType$, currentLanguage$, defaultLanguage$, itemAttributes$]).pipe(
        map(([contentType, currentLanguage, defaultLanguage, itemAttributes]) => {
          const itemValues: { [attributeName: string]: any } = {};
          for (const [name, values] of Object.entries(itemAttributes)) {
            itemValues[name] = LocalizationHelper.translate(currentLanguage, defaultLanguage, values, null);
          }

          const settings = contentType.Attributes.map(attribute => {
            const merged = this.mergeSettings<FieldSettings>(attribute.Metadata, currentLanguage, defaultLanguage);
            // update @All settings
            merged.Name ??= '';
            merged.Placeholder ??= '';
            merged.Notes ??= '';
            merged.VisibleInEditUI ??= true;
            merged.Required ??= false;
            merged.Disabled ??= false;
            merged.DisableTranslation ??= false;
            // update settings with respective FieldLogics
            const logic = FieldLogicManager.singleton().get(attribute.InputType);
            const fixed = logic?.update(merged, itemValues[attribute.Name]) ?? merged;
            return fixed;
          });
          return settings;
        }),
      ).subscribe(settings => {
        this.fieldsSettings$.next(settings);
      })
    );
  }

  public getContentTypeSettings$(): Observable<ContentTypeSettings> {
    return this.contentTypeSettings$.asObservable();
  }

  public getFieldSettings$(fieldName: string): Observable<FieldSettings> {
    return this.fieldsSettings$.pipe(
      map(fieldsSettings => fieldsSettings.find(f => f.Name === fieldName)),
      // TODO: smart distinctUntilChanged function
      distinctUntilChanged(),
      share(),
    );
  }

  private mergeSettings<T>(metadataItems: EavEntity[], currentLanguage: string, defaultLanguage: string): T {
    if (metadataItems == null) { return {} as T; }

    const merged: { [attributeName: string]: any } = {};
    // copy metadata settings which are not @All
    for (const item of metadataItems) {
      if (item.Type.Id === '@All') { continue; }

      for (const [name, values] of Object.entries(item.Attributes)) {
        const value = LocalizationHelper.translate(currentLanguage, defaultLanguage, values, null);
        merged[name] = value;
      }
    }

    // copy @All metadata settings, overwriting previous settings
    for (const item of metadataItems) {
      if (item.Type.Id !== '@All') { continue; }

      for (const [name, values] of Object.entries(item.Attributes)) {
        const value = LocalizationHelper.translate(currentLanguage, defaultLanguage, values, null);
        // do not overwrite previous settings if @All is empty
        const exists = merged[name] != null;
        const emptyAll = value == null || value === '';
        if (exists && emptyAll) { continue; }

        merged[name] = value;
      }
    }

    return merged as T;
  }

  private getContentTypeTitle(contentType: EavContentType, currentLanguage: string, defaultLanguage: string): string {
    let label: string;
    try {
      const type = contentType.Metadata
        // xx ContentType is a historic bug and should be fixed when JSONs are rechecked
        .find(metadata => metadata.Type.Name === 'ContentType' || metadata.Type.Name === 'xx ContentType');
      if (!!type) {
        label = LocalizationHelper.getValueOrDefault(type.Attributes.Label, currentLanguage, defaultLanguage)?.Value;
      }
      label = label || contentType.Name;
    } catch (error) {
      label = contentType.Name;
    }
    return label;
  }
}
