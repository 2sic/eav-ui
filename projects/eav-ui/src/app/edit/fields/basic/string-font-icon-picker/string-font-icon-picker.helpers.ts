import { IconOption } from './string-font-icon-picker.models';

/** Calculates available css classes with className prefix. WARNING: Expensive operation */
export function findAllIconsInCss(classPrefix: string, showPrefix: boolean) {

  if (!classPrefix)
    return [];

  const truncateLabel = showPrefix ? 0 : classPrefix.length - 1;

  const foundList: IconOption[] = [];
  const duplicateDetector: Record<string, boolean> = {};
  for (const sheet of Array.from(document.styleSheets)) {
    if (!sheet) continue;

    let rules: CSSRuleList;
    // Try old browser API (officially deprecated)
    try {
      rules = sheet.rules;
    } catch (error) { /* errors happens if browser denies access to css rules */ }

    // Try newer browser API
    if (!rules) {
      try {
        rules = sheet.cssRules;
      } catch (error) { /* errors happens if browser denies access to css rules */ }
    }
    if (!rules) continue;

    for (const rule of Array.from(rules) as CSSStyleRule[]) {
      if (!(rule.selectorText && rule.selectorText.startsWith(classPrefix))) continue;

      const selector = rule.selectorText;
      const fullClass = selector.substring(0, selector.indexOf(':'));
      const iconClass = fullClass.replace('.', '');
      if (duplicateDetector[iconClass]) continue;

      foundList.push({
        rule,
        class: iconClass,
        search: iconClass?.toLowerCase(),
        label: iconClass.substring(truncateLabel),
      });
      duplicateDetector[iconClass] = true;
    }
  }

  return foundList;
}
