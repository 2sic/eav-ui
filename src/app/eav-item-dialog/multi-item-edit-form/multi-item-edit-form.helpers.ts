import { Language } from '../../shared/models/eav';

export function sortLanguages(currentLangKey: string, languages: Language[]): Language[] {
  if (languages.length === 0) { return languages; }

  let currentLang: Language;
  const sameLangs: Language[] = [];
  const otherLangs: Language[] = [];
  for (let i = 0; i < languages.length; i++) {
    const language = languages[i];
    if (language.key === currentLangKey) {
      currentLang = language;
    } else if (language.key.startsWith(currentLangKey.split('-')[0])) {
      sameLangs.push(language);
    } else {
      otherLangs.push(language);
    }
  }
  sameLangs.sort(alphabetCompare);
  otherLangs.sort(alphabetCompare);

  if (!currentLang) {
    return [...sameLangs, ...otherLangs];
  } else {
    return [currentLang, ...sameLangs, ...otherLangs];
  }
}

function alphabetCompare(a: Language, b: Language): number {
  if (a.key < b.key) { return -1; }
  if (a.key > b.key) { return 1; }
  return 0;
}
