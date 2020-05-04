import { ActivatedRoute } from '@angular/router';

import { Language } from '../../shared/models/eav';

export function calculateIsParentDialog(route: ActivatedRoute) {
  let editDialogCount = 0;
  for (const path of route.snapshot.pathFromRoot) {
    if (path.url.length <= 0) { continue; }
    for (const urlSegment of path.url) {
      if (urlSegment.path !== 'edit') { continue; }
      editDialogCount++;
    }
  }
  return editDialogCount === 1;
}

export function sortLanguages(primaryLangKey: string, languages: Language[]): Language[] {
  if (languages.length === 0) { return languages; }

  let primaryLang: Language;
  const sameLangs: Language[] = [];
  const otherLangs: Language[] = [];
  for (const language of languages) {
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
