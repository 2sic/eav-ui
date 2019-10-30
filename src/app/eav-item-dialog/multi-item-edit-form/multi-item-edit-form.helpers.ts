import { Language } from '../../shared/models/eav';

export function sortLanguages(primaryLangKey: string, languages: Language[]): Language[] {
  if (languages.length === 0) { return languages; }

  let primaryLang: Language;
  const sameLangs: Language[] = [];
  const otherLangs: Language[] = [];
  for (let i = 0; i < languages.length; i++) {
    const language = languages[i];
    if (language.key === primaryLangKey) {
      primaryLang = language;
    } else if (language.key.startsWith(primaryLangKey.split('-')[0])) {
      sameLangs.push(language);
    } else {
      otherLangs.push(language);
    }
  }
  sameLangs.sort(alphabetCompare);
  otherLangs.sort(alphabetCompare);

  if (!primaryLang) {
    return [...sameLangs, ...otherLangs];
  } else {
    return [primaryLang, ...sameLangs, ...otherLangs];
  }
}

function alphabetCompare(a: Language, b: Language): number {
  if (a.key < b.key) { return -1; }
  if (a.key > b.key) { return 1; }
  return 0;
}
