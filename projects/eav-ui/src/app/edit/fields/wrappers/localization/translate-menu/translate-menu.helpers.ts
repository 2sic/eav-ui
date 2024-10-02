import { Of } from '../../../../../../../../core';
import { TranslationLinks } from '../../../../localization/translation-link.constants';

export class TranslateMenuHelpers {

  static getTranslationStateClass(linkType: Of<typeof TranslationLinks>) {
    switch (linkType) {
      case TranslationLinks.MissingDefaultLangValue:
        return 'localization-missing-default-lang-value';
      case TranslationLinks.Translate:
      case TranslationLinks.LinkCopyFrom:
        return 'localization-translate';
      case TranslationLinks.DontTranslate:
        return '';
      case TranslationLinks.LinkReadOnly:
        return 'localization-link-read-only';
      case TranslationLinks.LinkReadWrite:
        return 'localization-link-read-write';
      default:
        return '';
    }
  }

  static calculateSharedInfoMessage(dimensions: string[], currentLanguage: string): string {
    dimensions = TranslateMenuHelpers.calculateShortDimensions(dimensions, currentLanguage);
    const result = TranslateMenuHelpers.calculateEditAndReadDimensions(dimensions);
    const editableDimensions = result.editableDimensions;
    const readOnlyDimensions = result.readOnlyDimensions;
    let infoMessage = '';

    const editableExist = editableDimensions.length > 0;
    const readOnlyExist = readOnlyDimensions.length > 0;
    if (editableExist && readOnlyExist) {
      infoMessage = `${editableDimensions.join(', ')}, (${readOnlyDimensions.join(', ')})`;
    } else if (editableExist) {
      infoMessage = editableDimensions.join(', ');
    } else if (readOnlyExist) {
      infoMessage = `(${readOnlyDimensions.join(', ')})`;
    }

    return infoMessage;
  }

  private static calculateShortDimensions(dimensions: string[], currentLanguage: string): string[] {
    const dimMap: Record<string, string[]> = {};
    const langCode = currentLanguage.slice(0, currentLanguage.indexOf('-'));

    dimMap[langCode] = [langCode];

    dimensions.forEach(dimension => {
      const shortDimension = dimension.slice(0, dimension.indexOf('-'));
      const shortNoReadOnly = shortDimension.replace('~', '');

      if (!dimMap[shortNoReadOnly]) {
        dimMap[shortNoReadOnly] = [dimension];
      } else {
        dimMap[shortNoReadOnly].push(dimension);
      }
    });

    dimensions = dimensions.map(dimension => {
      const shortDimension = dimension.slice(0, dimension.indexOf('-'));
      const shortNoReadOnly = shortDimension.replace('~', '');

      if (dimMap[shortNoReadOnly].length > 1) {
        return dimension;
      } else {
        return shortDimension;
      }
    });

    return dimensions;
  }

  private static calculateEditAndReadDimensions(dimensions: string[]) {
    return {
      editableDimensions: [] as string[],
      readOnlyDimensions: dimensions.map(d => d.replace('~', '')),
    };
  }
}
