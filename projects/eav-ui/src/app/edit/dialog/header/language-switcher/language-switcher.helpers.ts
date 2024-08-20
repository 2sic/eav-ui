import { Language } from '../../../state/form-languages.model';

export interface LanguageButton extends Language {
  buttonText: string;
}

/** Calculates properties of language buttons, e.g. name to be displayed */
export function getLanguageButtons(languages: Language[]): LanguageButton[] {
  const languageButtons: LanguageButton[] = [];
  const shortCodesCount: Record<string, number> = {};

  // count the number of repetitions of the same language without region key
  // e.g. English (United States) and English (Australia) are both English
  languages.forEach(language => {
    const shortName = removeRegionName(language.Culture);
    if (shortCodesCount[shortName])
      shortCodesCount[shortName]++;
    else
      shortCodesCount[shortName] = 1;
  });

  // if language repeats, append language key to name which will be displayed
  languages.forEach(language => {
    const shortCode = removeRegionName(language.Culture);

    languageButtons.push({
      ...language,
      buttonText: (shortCodesCount[shortCode] > 1) ? `${shortCode} (${language.NameId})` : shortCode,
    });
  });

  return languageButtons;
}

/** Returns name without region, e.g. ENGLISH from English (United Stated) */
function removeRegionName(languageName: string): string {
  return languageName.substring(0, languageName.includes('(') ? languageName.indexOf('(') - 1 : 100).toLocaleUpperCase();
}
