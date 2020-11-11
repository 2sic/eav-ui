import { combineLatest, Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { FieldSettings } from '../../../../edit-types';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';
import { ContentType, EavHeader } from '../../../shared/models/eav';

export class CollapsibleWrapperLogic {
  constructor() { }

  update(
    settings$: Observable<FieldSettings>,
    header$: Observable<EavHeader>,
    isParentGroup: boolean,
    currentLanguage$: Observable<string>,
    defaultLanguage$: Observable<string>,
    contentType$: Observable<ContentType>,
  ): Observable<FieldSettings> {
    return combineLatest([settings$, header$, currentLanguage$, defaultLanguage$, contentType$]).pipe(
      map(([settings, header, currentLanguage, defaultLanguage, contentType]) => {
        const fixedSettings = { ...settings };
        if (fixedSettings.VisibleInEditUI == null) { fixedSettings.VisibleInEditUI = true; }
        if (fixedSettings.DefaultCollapsed == null) { fixedSettings.DefaultCollapsed = false; }
        if (fixedSettings.EditInstructions == null) { fixedSettings.EditInstructions = ''; }
        if (fixedSettings.Notes == null) { fixedSettings.Notes = ''; }
        fixedSettings._itemTitle = !isParentGroup
          ? fixedSettings.Name
          : this.getContentTypeTitle(currentLanguage, defaultLanguage, contentType);
        fixedSettings._slotCanBeEmpty = header?.Group?.SlotCanBeEmpty || false;
        fixedSettings._slotIsEmpty = header?.Group?.SlotIsEmpty || false;
        fixedSettings._description = isParentGroup ? fixedSettings.EditInstructions : fixedSettings.Notes;
        return fixedSettings;
      }),
      share(),
    );
  }

  private getContentTypeTitle(currentLanguage: string, defaultLanguage: string, contentType: ContentType): string {
    let label: string;
    try {
      const type = contentType.contentType.metadata
        // xx ContentType is a historic bug and should be fixed when JSONs are rechecked
        .find(metadata => metadata.type.name === 'ContentType' || metadata.type.name === 'xx ContentType');
      if (!!type) {
        label = LocalizationHelper.getValueOrDefault(type.attributes.Label, currentLanguage, defaultLanguage)?.value;
      }
      label = label || contentType.contentType.name;
    } catch (error) {
      label = contentType.contentType.name;
    }
    return label;
  }
}
