import { EavFor } from '../../edit/shared/models/eav';
import { eavConstants } from '../constants/eav.constants';
import { classLog } from '../logging';
import { EditForm, EditPrep, ItemAddIdentifier, ItemEditIdentifier, ItemIdentifierInbound, ItemIdentifierShared, ItemInListIdentifier } from '../models/edit-form.model';

const log = classLog("UrlPrepHelper")

const PREFILL_PREFIX = 'prefill:';
const GROUP_PREFIX = 'group:';
const FIELDS_PREFIX = 'uifields:';
const PARAM_PREFIX = 'parameters:';
const ITEM_SEPARATOR = ',';
const VAL_SEPARATOR = '&';
const LIST_SEPARATOR = ':';

function toOrderedParams(values: unknown[]): string {
  return values.join(LIST_SEPARATOR);
}

export function convertFormToUrl(form: EditForm) {
  const l = log.fn('convertFormToUrl', { form });
  let formUrl = '';

  for (const item of form.items) {
    // If we already have one, the next must be separated
    if (formUrl) formUrl += ITEM_SEPARATOR;

    const asGroup = item as ItemInListIdentifier;
    const asItem = item as ItemEditIdentifier;
    const asInboundParams = item as ItemIdentifierInbound;
    // Fields/Parameters can come from two places
    // When a link is inbound from the page, it will use UiFields/Parameters
    // If it's from the Admin-UI itself, it should use the newer / deeper ClientData
    const fields = asInboundParams.UiFields ?? item.ClientData?.fields;
    const parameters = asInboundParams.Parameters ?? item.ClientData?.parameters;
    // Group- or Inner-Item
    if (asGroup.Parent) {
      l.a("asGroup having parent", {asGroup});
      formUrl += GROUP_PREFIX + toOrderedParams([
        asGroup.Parent,
        asGroup.Field,
        asGroup.Index,
        asGroup.Add,
        asGroup.EntityId
      ]);
      formUrl += prefill2UrlParams(asGroup.Prefill);
      formUrl += fields2UrlParams(fields);
      formUrl += obj2UrlParams(parameters, PARAM_PREFIX);

    } else if (asItem.EntityId) {
      l.a("asItem having entity id", {asItem});
      // Edit Item
      formUrl += asItem.EntityId;

      // New: fields
      formUrl += fields2UrlParams(fields);
      formUrl += obj2UrlParams(parameters, PARAM_PREFIX);

      // 2023-05-11 in edit-id mode, prefill isn't supported, but we want the fields
      // I actually think that prefill should be supported, because it can also transport more parameters
      // formUrl += prefill2UrlParams(groupItem.Prefill, fields);

      // 2024-05-30 2dm reactivating prefill on edit, for scenarios where new fields were added
      // and for ephemeral control fields
      // 2024-06-01 2dm re-disabled, since this also affects links coming in from the page
      // so this could be an unexpected breaking change...
      // formUrl += prefill2UrlParams(asItem.Prefill);

    } else if ((item as ItemAddIdentifier).ContentTypeName) {
      l.a("asItem having content type name", {item});
      // Add Item
      const addItem = item as ItemAddIdentifier;
      formUrl += 'new:' + addItem.ContentTypeName;

      formUrl += getParamForMetadata(addItem);
      formUrl += prefill2UrlParams(addItem.Prefill);
      formUrl += fields2UrlParams(fields);
      formUrl += obj2UrlParams(parameters, PARAM_PREFIX);

      if (addItem.DuplicateEntity)
        formUrl += `${VAL_SEPARATOR}copy:` + addItem.DuplicateEntity;
    }
  }

  return l.r(formUrl);
}

function getParamForMetadata(addItem: ItemAddIdentifier) {
  const l = log.fn("getParamForMetadata", {addItem});

  // helper function
  const buildForSuffix = (itemFor: EavFor) => toOrderedParams([
    '', // empty string to ensure it will start with a ":"
    itemFor.Target,
    itemFor.TargetType,
    (itemFor.Singleton ? itemFor.Singleton.toString() : '')
  ]);

  if (addItem.For?.String)
    return l.r(`${VAL_SEPARATOR}for:s~` + paramEncode(addItem.For.String) + buildForSuffix(addItem.For), "for string");
  if (addItem.For?.Number)
    return l.r(`${VAL_SEPARATOR}for:n~` + addItem.For.Number + buildForSuffix(addItem.For), "for number");
  if (addItem.For?.Guid)
    return l.r(`${VAL_SEPARATOR}for:g~` + addItem.For.Guid + buildForSuffix(addItem.For), "for guid");
  if (addItem.Metadata)
    return l.r(getParamForOldMetadata(addItem), "metadata");
  return l.r('', "other");
}

function getParamForOldMetadata(addItem: ItemAddIdentifier) {
  const l = log.fn("getParamForOldMetadata", {addItem});
  let keyType: string;
  switch (addItem.Metadata.keyType.toLocaleLowerCase()) {
    case eavConstants.keyTypes.string:
      keyType = 's';
      break;
    case eavConstants.keyTypes.number:
      keyType = 'n';
      break;
    case eavConstants.keyTypes.guid:
      keyType = 'g';
      break;
  }
  const target = Object.values(eavConstants.metadata)
    .find(m => m.targetType === addItem.Metadata.targetType)?.target;
  const result = `${VAL_SEPARATOR}for:` + keyType + '~' + toOrderedParams([
    paramEncode(addItem.Metadata.key),
    target,
    addItem.Metadata.targetType
  ]);
  return l.r(result, result);
}

function prefill2UrlParams(prefill: Record<string, unknown>) {
  return obj2UrlParams(prefill, PREFILL_PREFIX);
}

function obj2UrlParams(obj: Record<string, unknown>, prefix: string) {
  let result = '';
  if (!obj) return result;
  for (const [key, value] of Object.entries(obj)) {
    if (value == null) continue;
    result += `${VAL_SEPARATOR}${prefix}${key}~${paramEncode(value.toString())}`;
  }
  return result;
}

function prefillFromUrlParams(url: string, addTo: Record<string, unknown>): Record<string, unknown> {
  const result = addTo ?? {} as Record<string, string>;
  if (url == null) return result;
  const prefillParams = url.split(LIST_SEPARATOR);
  const key = prefillParams[1].split('~')[0];
  const value = paramDecode(prefillParams[1].split('~')[1]);
  result[key] = value;
  return result;
}

// function objFromUrlParams(url: string, addTo: Record<string, string>, prefix: string): Record<string, string> {
//   const result = addTo ?? {} as Record<string, string>;
//   if (url == null) return result;
//   const prefillParams = url.split(LIST_SEPARATOR);
//   const key = prefillParams[1].split('~')[0];
//   const value = paramDecode(prefillParams[1].split('~')[1]);
//   result[key] = value;
//   return result;
// }

function fields2UrlParams(fields: string) {
  return fields ? `${VAL_SEPARATOR}${FIELDS_PREFIX}${paramEncode(fields)}` : '';
}

function isNumber(maybeNumber: string): boolean {
  // The regex must be re-created for each test
  return /^[0-9]*$/g.test(maybeNumber);
}

export function convertUrlToForm(formUrl: string) {
  const l = log.fn("convertUrlToForm", { formUrl });
  const form: EditForm = { items: [] };
  const items = formUrl.split(ITEM_SEPARATOR);

  for (const item of items) {
    l.a("item", {item});
    if (item.startsWith(GROUP_PREFIX)) {
      // Inner Item / Group Item
      const innerItem = {} as ItemInListIdentifier;
      const options = item.split(VAL_SEPARATOR);

      for (const option of options) {
        if (option.startsWith(GROUP_PREFIX)) {
          const parms = option.split(LIST_SEPARATOR);
          innerItem.Parent = parms[1];
          innerItem.Field = parms[2];
          innerItem.Index = parseInt(parms[3], 10);
          innerItem.Add = parms[4] === 'true';
          if (parms.length > 4 && parms[5] && isNumber(parms[5]))
            innerItem.EntityId = parseInt(parms[5], 10);
        } else
          addParamToItemIdentifier(innerItem, option);
      }
      form.items.push(innerItem);
    } else if (isNumber((item ?? '').split(VAL_SEPARATOR)[0])) {
      // Edit Item
      const parts = item.split(VAL_SEPARATOR);
      const editItem: ItemEditIdentifier = EditPrep.editId(parseInt(parts[0], 10));
      for (const part of parts)
        addParamToItemIdentifier(editItem, part);
      form.items.push(editItem);
    } else if (item.startsWith('new:')) {
      // Add Item
      const addItem = {} as ItemAddIdentifier;
      const options = item.split(VAL_SEPARATOR);

      for (const option of options) {
        if (option.startsWith('new:')) {
          // Add Item ContentType
          const newParams = option.split(LIST_SEPARATOR);
          addItem.ContentTypeName = newParams[1];
        } else if (option.startsWith('for:')) {
          // Add Item For
          const forParams = option.split(LIST_SEPARATOR);
          const forKeyType = forParams[1].split('~')[0];
          const forKey = forParams[1].split('~')[1];
          const forTarget = forParams[2];
          const forTargetType = parseInt(forParams[3], 10);
          const forSingleton = forParams[4] != null ? forParams[4] === 'true' : undefined;
          addItem.For = {
            Target: forTarget,
            TargetType: forTargetType,
            ...(forKeyType === 'g' && { Guid: forKey }),
            ...(forKeyType === 'n' && { Number: parseInt(forKey, 10) }),
            ...(forKeyType === 's' && { String: paramDecode(forKey) }),
            ...(forSingleton != null && { Singleton: forSingleton }),
          };
        } else if (option.startsWith('copy:')) {
          // Add Item Copy
          const copyParams = option.split(LIST_SEPARATOR);
          addItem.DuplicateEntity = parseInt(copyParams[1], 10);
        } else
          addParamToItemIdentifier(addItem, option);
      }
      form.items.push(addItem);
    }
  }
  return l.r(form);
}

/** add prefill and filter to url parameters */
function addParamToItemIdentifier(item: ItemIdentifierShared, part: string): void {
  const l = log.fn("addParamToItemIdentifier", {item, part});
  if (part.startsWith(FIELDS_PREFIX)) {
    const fields = paramDecode(part.split(':')[1]);
    // temp hacky workaround - put it prefill so it's still there after round-trip
    // should later be on the re-added after the round-trip on the Fields property
    item.Prefill = prefillFromUrlParams(part, { fields });
    item.ClientData = { ...item.ClientData, fields };
    return l.end();
  }
  // Add Item Prefill
  if (part.startsWith(PREFILL_PREFIX)) {
    item.Prefill = prefillFromUrlParams(part, item.Prefill);
    return l.end();
  }
  // Add Item Form
  if (part.startsWith(PARAM_PREFIX)) {
    const formParams = prefillFromUrlParams(part, item.ClientData?.parameters);
    item.ClientData = { ...item.ClientData, parameters: formParams };
    return l.end();
  }
  l.end('no match');
}

/** Encodes characters in URL parameter to not mess up routing. Don't forget to decode it! :) */
function paramEncode(text: string) {
  return (text ?? '')
    .replace(/\//g, '%2F')
    .replace(/\:/g, '%3A')
    .replace(/\&/g, '%26')
    .replace(/\~/g, '%7E')
    .replace(/\,/g, '%2C');
}

/** Decodes characters in URL parameter */
function paramDecode(text: string) {
  return (text ?? '')
    .replace(/%2F/g, '/')
    .replace(/%3A/g, ':')
    .replace(/%26/g, '&')
    .replace(/%7E/g, '~')
    .replace(/%2C/g, ',');
}

export const _test = {
  paramEncode,
  paramDecode,
};