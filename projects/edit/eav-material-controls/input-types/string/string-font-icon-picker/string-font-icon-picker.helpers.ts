import { IconOption, LoadedIcons } from './string-font-icon-picker.models';

/** Calculates available css classes with className prefix. WARNING: Expensive operation */
export function calculateIconOptions(className: string) {
  const foundList: IconOption[] = [];
  const duplicateDetector: LoadedIcons = {};

  if (!className) { return foundList; }

  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i] as CSSStyleSheet;
    if (!sheet) { continue; }

    let rules: CSSRuleList;
    try {
      rules = sheet.rules;
    } catch (error) { /* errors happens if browser denies access to css rules */ }
    if (!rules) {
      try {
        rules = sheet.cssRules;
      } catch (error) { /* errors happens if browser denies access to css rules */ }
    }
    if (!rules) { continue; }

    // tslint:disable-next-line:prefer-for-of
    for (let j = 0; j < rules.length; j++) {
      const rule = rules[j] as CSSStyleRule;
      if (!(rule.selectorText && rule.selectorText.startsWith(className))) { continue; }

      const selector = rule.selectorText;
      const iconClass = selector.substring(0, selector.indexOf(':')).replace('.', '');
      if (duplicateDetector[iconClass]) { continue; }

      foundList.push({ rule, class: iconClass });
      duplicateDetector[iconClass] = true;
    }
  }

  return foundList;
}
