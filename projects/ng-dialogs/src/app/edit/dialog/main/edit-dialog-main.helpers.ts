import { ActivatedRoute } from '@angular/router';
import { Language } from '../../shared/models';

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

export function sortLanguages(primaryLangKey: string, languages: Language[]) {
  if (languages.length === 0) { return languages; }

  let primaryLang: Language;
  const sameLangs: Language[] = [];
  const otherLangs: Language[] = [];
  for (const language of languages) {
    if (language.NameId === primaryLangKey) {
      primaryLang = language;
    } else if (language.NameId.startsWith(primaryLangKey.split('-')[0])) {
      sameLangs.push(language);
    } else {
      otherLangs.push(language);
    }
  }
  sameLangs.sort((a, b) => a.NameId.localeCompare(b.NameId));
  otherLangs.sort((a, b) => a.NameId.localeCompare(b.NameId));

  const allLangsSorted: Language[] = !primaryLang ? [...sameLangs, ...otherLangs] : [primaryLang, ...sameLangs, ...otherLangs];
  return allLangsSorted;
}
