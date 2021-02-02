import { Injectable, OnDestroy } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EavService } from '.';
import { FieldSettings } from '../../../edit-types';
import { InputFieldHelper } from '../helpers/input-field-helper';
import { LocalizationHelper } from '../helpers/localization-helper';
import { ContentTypeSettings } from '../models';
import { EavContentType, EavEntity, EavItem } from '../models/eav';
import { ContentTypeService } from '../store/ngrx-data/content-type.service';
import { ItemService } from '../store/ngrx-data/item.service';
import { LanguageInstanceService } from '../store/ngrx-data/language-instance.service';

@Injectable()
export class FieldsSettings2Service implements OnDestroy {
  private contentTypeSettings$: Observable<ContentTypeSettings>;
  private fieldsSettings$: Observable<FieldSettings[]>;

  constructor(
    private contentTypeService: ContentTypeService,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
    private itemService: ItemService,
  ) { }

  ngOnDestroy(): void {
  }

  public init(item: EavItem): void {
    const contentTypeId = InputFieldHelper.getContentTypeId(item);
    const contentType$ = this.contentTypeService.getContentTypeById(contentTypeId);
    const header$ = this.itemService.selectItemHeader(item.Entity.Guid);
    const formId = this.eavService.eavConfig.formId;
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage(formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(formId);

    this.contentTypeSettings$ = combineLatest([contentType$, header$, currentLanguage$, defaultLanguage$]).pipe(
      map(([contentType, header, currentLanguage, defaultLanguage]) => {
        const contentTypeSettings = this.mergeSettings<ContentTypeSettings>(contentType.Metadata, currentLanguage, defaultLanguage);
        contentTypeSettings.Description ??= '';
        contentTypeSettings.EditInstructions ??= '';
        contentTypeSettings.Label ??= '';
        contentTypeSettings.ListInstructions ??= '';
        contentTypeSettings.Notes ??= '';
        contentTypeSettings.Icon ??= '';
        contentTypeSettings.Link ??= '';
        contentTypeSettings._itemTitle = this.getContentTypeTitle(contentType, currentLanguage, defaultLanguage);
        contentTypeSettings._slotCanBeEmpty = header?.Group?.SlotCanBeEmpty ?? false;
        contentTypeSettings._slotIsEmpty = header?.Group?.SlotIsEmpty ?? false;
        return contentTypeSettings;
      }),
    );

    this.fieldsSettings$ = combineLatest([contentType$, currentLanguage$, defaultLanguage$]).pipe(
      map(([contentType, currentLanguage, defaultLanguage]) => {
        const fieldSettings = contentType.Attributes.map(attribute => {
          const merged = this.mergeSettings<FieldSettings>(attribute.Metadata, currentLanguage, defaultLanguage);
          // TODO: Apply field settings logics here
          return merged;
        });
        return fieldSettings;
      }),
    );
  }

  public getContentTypeSettings() {
    return this.contentTypeSettings$;
  }

  public getFieldSettings(fieldName: string): Observable<FieldSettings> {
    return this.fieldsSettings$.pipe(
      map(fieldsSettings => fieldsSettings.find(f => f.Name === fieldName)),
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
