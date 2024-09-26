import { classLog } from 'projects/eav-ui/src/app/shared/logging';
import { IconOption } from './string-font-icon-picker.models';

const specs = {
  findAllIconsInCss: true,
};

/** Calculates available css classes with className prefix. WARNING: Expensive operation */
export function findAllIconsInCss(classPrefix: string, showPrefix?: boolean, valueRaw?: string, value?: string): IconOption[] {

  const _selector = classPrefix;
  const _valueRaw = valueRaw;
  const _value = value;

  const log = classLog({ findAllIconsInCss }, specs);

  if (!classPrefix) return [];

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
      const iconClass = fullClass.replace('.', '').trim(); // Trim whitespace
      //
      const value = iconClass;
      const valueRaw = "." + iconClass;

      // Skip empty icon classes
      if (!iconClass) continue;

      if (duplicateDetector[iconClass]) continue;


      foundList.push({
        rule,
        class: iconClass,
        search: iconClass.toLowerCase(),
        label: iconClass.substring(truncateLabel),
        _selector: _selector,
        _valueRaw: _valueRaw, // new valueRaw for Picker
        _value: _value, // new Value
      });
      duplicateDetector[iconClass] = true;
    }
  }

  log.fnIf('findAllIconsInCss', { classPrefix, showPrefix, foundList });

  return foundList;
}
