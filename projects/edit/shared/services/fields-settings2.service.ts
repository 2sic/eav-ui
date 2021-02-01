import { Injectable, OnDestroy } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EavService } from '.';
import { FieldSettings } from '../../../edit-types';
import { InputFieldHelper } from '../helpers/input-field-helper';
import { LocalizationHelper } from '../helpers/localization-helper';
import { EavEntity, EavItem } from '../models/eav';
import { ContentTypeService } from '../store/ngrx-data/content-type.service';
import { LanguageInstanceService } from '../store/ngrx-data/language-instance.service';

@Injectable()
export class FieldsSettings2Service implements OnDestroy {
  private contentTypeSettings$: Observable<FieldSettings>;
  private fieldsSettings$: Observable<FieldSettings[]>;

  constructor(
    private contentTypeService: ContentTypeService,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
  ) { }

  ngOnDestroy(): void {
  }

  public init(item: EavItem): void {
    // subscribe to store and build default configs
    const contentTypeId = InputFieldHelper.getContentTypeId(item);
    const contentType$ = this.contentTypeService.getContentTypeById(contentTypeId);
    const formId = this.eavService.eavConfig.formId;
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage(formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(formId);

    this.contentTypeSettings$ = combineLatest([contentType$, currentLanguage$, defaultLanguage$]).pipe(
      map(([contentType, currentLanguage, defaultLanguage]) => {
        const contentTypeSettings = this.mergeSettings(contentType.Metadata, currentLanguage, defaultLanguage);
        return contentTypeSettings;
      }),
    );

    this.fieldsSettings$ = combineLatest([contentType$, currentLanguage$, defaultLanguage$]).pipe(
      map(([contentType, currentLanguage, defaultLanguage]) => {
        const fieldSettings = contentType.Attributes.map(attribute =>
          this.mergeSettings(attribute.Metadata, currentLanguage, defaultLanguage));
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

  private mergeSettings(metadataItems: EavEntity[], currentLanguage: string, defaultLanguage: string): FieldSettings {
    if (metadataItems == null) { return {} as FieldSettings; }

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

    return merged as FieldSettings;
  }
}
