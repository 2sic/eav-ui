import escapeRegExp from 'lodash-es/escapeRegExp';
import { EntityLight } from '../../../../../../../../edit-types/src/EntityLight';
import { classLog } from '../../../../../shared/logging/logging';

const logSpecs = {
  all: true,
  findAllIconsInCss: false,
};

/** Calculates available css classes with className prefix. WARNING: Expensive operation */
export function findAllIconsInCss(cssSelector: string, showPrefix?: boolean): EntityLight[] {

  const log = classLog({ findAllIconsInCss }, logSpecs);

  const l = log.fnIf('findAllIconsInCss', { cssSelector, showPrefix });

  if (!cssSelector)
    return [];

  const regEx = buildRegEx(cssSelector);
  console.warn(regEx)

  const allRules = getAllCssRules();
  const foundList: IconOption[] = [];
  const duplicateDetector: Record<string, boolean> = {};
  for (const rules of allRules) {
    const allRulesWithSelector = (Array.from(rules) as CSSStyleRule[])
      .filter(rule => rule.selectorText);

    for (const rule of allRulesWithSelector) {
      // The full selector text, such as ".fa-x-ray:before"
      // Note that ATM we're still looking for icons, which is probably not the final solution
      const selector = rule.selectorText;

      // Reset the regex, otherwise it will only work every second time
      regEx.lastIndex = 0;
      const groups = regEx.exec(selector)?.groups;

      // Skip if not found
      if (!groups)
        continue;
      
      console.log('regExed', groups.Value, groups.ValueRaw, groups.Title);

      const iconClass = groups.ValueRaw;

      if (duplicateDetector[iconClass]) continue;

      foundList.push({
        Id: null,
        Guid: null,
        Rule: rule,
        ...groups as { Value: string, ValueRaw: string, Title: string },
        Selector: selector,
      });
      duplicateDetector[iconClass] = true;
    }
  }

  l.a('findAllIconsInCss', { classPrefix: cssSelector, showPrefix, foundList });

  return l.r(foundList);
}

const fallbackRegex = `(?<ValueRaw>\\.(?<Value>(?<Title>[\\-a-zA-Z0-9]+)))[:,\{}]`;
const fontAwesomeRegex = `(?<ValueRaw>\\.(?<Value>fa-(?<Title>[\\-a-zA-Z0-9]+))):`;

function buildRegEx(cssSelector: string): RegExp {
  if (!cssSelector)
    return new RegExp(fallbackRegex);

  // If it contains a <, it's a regex with the names, so use that, but be sure to double-escape the backslashes
  if (cssSelector.includes('<'))
    return new RegExp(cssSelector, 'g');

  // It's just a starts with, so create the default regex
  const regEx = buildRegExFromPrefixAndSuffix(cssSelector, '[:\{,]');

  return new RegExp(regEx, 'g');
}

export function buildRegExFromPrefixAndSuffix(prefix: string, suffix: string): string {
  if (!prefix) return '';
  const valueRaw = buildRegExFromPrefix(prefix);
  const withEnding = `${valueRaw}${suffix}`;
  return withEnding;
}

function buildRegExFromPrefix(prefix: string): string {
  if (!prefix)
    return '';

  // Capturing group called "Title" containing the main part of the capture
  const titlePart = '(?<Title>[\\-a-zA-Z0-9]+)';
  // Check if it has a dot, which we don't want in the Value, but we want in the ValueRaw
  const startedWithDot = prefix.startsWith('.');
  const cssSelectorPart = startedWithDot ? prefix.substring(1) : prefix;

  // Capturing group with name Value
  const valuePart = `(?<Value>${escapeRegExp(cssSelectorPart)}${titlePart})`;

  // If it started with a dot, we want to capture the dot as well
  const valueWithPrefix = startedWithDot ? `${escapeRegExp('.')}${valuePart}` : valuePart;
  // Capturing group with name ValueRaw
  const valueRaw = `(?<ValueRaw>${valueWithPrefix})`;
  return valueRaw;
}


function getAllCssRules(): CSSRuleList[] {
  const allRules: CSSRuleList[] = Array.from(document.styleSheets)
    .map(getCssRules)
    .filter(Boolean);
  return allRules;
}

function getCssRules(sheet: CSSStyleSheet): CSSRuleList {
  if (!sheet) return null;
  
  // Try old browser API (officially deprecated)
  try {
    return sheet.rules;
  } catch (error) { /* errors happens if browser denies access to css rules */ }

  // Try newer browser API
  try {
    return sheet.cssRules;
  } catch (error) { /* errors happens if browser denies access to css rules */ }

  return null;
}


export interface IconOption extends EntityLight {
  Rule: CSSRule;
  /** The Class - which is the main value we're picking */
  Value: string;
  /** Label for showing in the dropdown */
  Title: string;

  /** Optional: Icon class for new Picker */
  ValueRaw?: string;
  Selector?: string;
}
