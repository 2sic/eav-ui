import { combineLatest, Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { FieldSettings } from '../../../../edit-types';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';
import { ContentType, EavHeader } from '../../../shared/models/eav';

export class FormCollapsibleLogic {
  constructor() { }

  update(
    settings$: Observable<FieldSettings>,
    currentLanguage$: Observable<string>,
    defaultLanguage$: Observable<string>,
    header$: Observable<EavHeader>,
    contentType$: Observable<ContentType>,
  ): Observable<FieldSettings> {
    return combineLatest([settings$, currentLanguage$, defaultLanguage$, header$, contentType$]).pipe(
      map(([settings, currentLanguage, defaultLanguage, header, contentType]) => {
        const fixedSettings = { ...settings };
        if (fixedSettings.EditInstructions == null) { fixedSettings.EditInstructions = ''; }
        fixedSettings._itemTitle = this.getContentTypeTitle(currentLanguage, defaultLanguage, contentType);
        fixedSettings._slotCanBeEmpty = header?.Group?.SlotCanBeEmpty || false;
        fixedSettings._slotIsEmpty = header?.Group?.SlotIsEmpty || false;
        return fixedSettings;
      }),
      share(),
    );
  }

  private getContentTypeTitle(currentLanguage: string, defaultLanguage: string, contentType: ContentType): string {
    let label: string;
    try {
      const type = contentType.Metadata
        // xx ContentType is a historic bug and should be fixed when JSONs are rechecked
        .find(metadata => metadata.Type.Name === 'ContentType' || metadata.Type.Name === 'xx ContentType');
      if (!!type) {
        label = LocalizationHelper.getValueOrDefault(type.Attributes.Label, currentLanguage, defaultLanguage)?.value;
      }
      label = label || contentType.Name;
    } catch (error) {
      label = contentType.Name;
    }
    return label;
  }
}
