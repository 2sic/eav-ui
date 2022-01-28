import { Language } from '../../../shared/models';

export interface LanguageButton extends Language {
  buttonText: string;
}

/** Calculates properties of language buttons, e.g. name to be desplayed */
export function getLanguageButtons(languages: Language[]): LanguageButton[] {
  const languageButtons: LanguageButton[] = [];
  const regionlessNamesCount: Record<string, number> = {};

  // count the number of repetitions of the same language without region key
  // e.g. English (United States) and English (Australia) are both English
  languages.forEach(language => {
    const regionlessName = removeRegionName(language.Culture);
    if (regionlessNamesCount[regionlessName]) {
      regionlessNamesCount[regionlessName]++;
    } else {
      regionlessNamesCount[regionlessName] = 1;
    }
  });

  // if language repeats, append language key to name which will be displayed
  languages.forEach(language => {
    const regionlessName = removeRegionName(language.Culture);

    languageButtons.push({
      ...language,
      buttonText: (regionlessNamesCount[regionlessName] > 1) ? `${regionlessName} (${language.NameId})` : regionlessName,
    });
  });

  return languageButtons;
}

/** Returns name without region, e.g. ENGLISH from English (United Stated) */
function removeRegionName(languageName: string): string {
  return languageName.substring(0, languageName.includes('(') ? languageName.indexOf('(') - 1 : 100).toLocaleUpperCase();
}
