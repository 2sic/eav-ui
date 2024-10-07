import { classLog } from 'projects/eav-ui/src/app/shared/logging';
import { IconOption } from './string-font-icon-picker.models';


const logSpecs = {
  all: true,
  findAllIconsInCss: true,
};

/** Calculates available css classes with className prefix. WARNING: Expensive operation */
export function findAllIconsInCss(cssSelector: string, showPrefix?: boolean): IconOption[] {

  const log = classLog({ findAllIconsInCss }, logSpecs, true);

  const l = log.fnIf('findAllIconsInCss', { cssSelector, showPrefix });

  if (!cssSelector) return [];

  const truncateLabel = showPrefix ? 0 : cssSelector.length - 1;

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
      if (!(rule.selectorText && rule.selectorText.startsWith(cssSelector)))
        continue;

      const selector = rule.selectorText;
      const fullClass = selector.substring(0, selector.indexOf(':'));
      const iconClass = fullClass.replace('.', '').trim(); // Trim whitespace
      const valueRaw = "." + iconClass;

      // Skip empty icon classes
      if (!iconClass) continue;

      if (duplicateDetector[iconClass]) continue;


      foundList.push({
        rule,
        class: iconClass,
        search: iconClass.toLowerCase(),
        label: iconClass.substring(truncateLabel),
        selector: selector,
        valueRaw: valueRaw, // new valueRaw for Picker
      });
      duplicateDetector[iconClass] = true;
    }
  }

  l.a('findAllIconsInCss', { classPrefix: cssSelector, showPrefix, foundList });

  return l.r(foundList);
}
