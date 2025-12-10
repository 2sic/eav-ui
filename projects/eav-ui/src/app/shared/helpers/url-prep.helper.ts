import { EavFor } from '../../edit/shared/models/eav';
import { eavConstants } from '../constants/eav.constants';
import { classLog } from '../logging';
import { EditForm, EditPrep, ItemAddIdentifier, ItemEditIdentifier, ItemIdentifierInbound, ItemIdentifierShared, ItemInListIdentifier } from '../models/edit-form.model';
import { ParamEncoder } from './param-encoder';

// Note: everything in here is a bit magical - and probably not ideal
// It basically prepares a very compact url representation of an EditForm
// so it can be passed in urls
// The format is not documented anywhere - so changing it will likely break things
// so be careful!
// In some cases, order matters, in others there are prefixes to identify parts

const log = classLog("UrlPrepHelper")

const PREFILL_PREFIX = 'prefill:';
const GROUP_PREFIX = 'group:';
const UIFIELDS_PREFIX = 'uifields:';
const PARAM_PREFIX = 'parameters:';
const ITEM_SEPARATOR = ',';
const VAL_SEPARATOR = '&';
const LIST_SEPARATOR = ':';
const METADATA_SEPARATOR = '~';

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
      formUrl += addTypicalUrlGroups(asGroup, fields, parameters,
        { prefill: true, fields: true, params: true, duplicate: true }
      );

    } else if (asItem.EntityId) {
      l.a("asItem having entity id", {asItem});
      // Edit Item
      formUrl += asItem.EntityId;

      // New: fields
      formUrl += addTypicalUrlGroups(asItem, fields, parameters,
        { fields: true, params: true }
      );

      // 2023-05-11 in edit-id mode, prefill isn't supported, but we want the fields
      // I actually think that prefill should be supported, because it can also transport more parameters
      // formUrl += prefill2UrlParams(groupItem.Prefill, fields);

      // 2024-05-30 2dm reactivating prefill on edit, for scenarios where new fields were added
      // and for ephemeral control fields
      // 2024-06-01 2dm re-disabled, since this also affects links coming in from the page
      // so this could be an unexpected breaking change...
      // formUrl += prefill2UrlParams(asItem.Prefill);

    
    }
    // Add item, optionally with For-Metadata
    else if ((item as ItemAddIdentifier).ContentTypeName) {
      l.a("asItem having content type name", {item});
      // Add Item
      const addItem = item as ItemAddIdentifier;
      formUrl += 'new:' + addItem.ContentTypeName;

      formUrl += addTypicalUrlGroups(addItem, fields, parameters,
        { metadata: true, prefill: true, fields: true, params: true, duplicate: true }
      );
    }
  }
  return l.r(formUrl);
}

function addTypicalUrlGroups(
  item: ItemAddIdentifier | ItemEditIdentifier | ItemInListIdentifier,
  fields: string | undefined,
  parameters: Record<string, unknown> | undefined,
  parts: { metadata?: boolean, prefill?: boolean, fields?: boolean, params?: boolean, duplicate?: boolean }
): string {
  const addItem = item as ItemAddIdentifier;
  const result = ''
    + (parts.metadata ? getParamForMetadata(addItem) : '')
    + (parts.prefill ? prefill2UrlParams(item.Prefill) : '')
    + (parts.fields ? fields2UrlParams(fields) : '')
    + (parts.params ? obj2UrlParams(parameters, PARAM_PREFIX) : '')
    + (parts.duplicate && addItem.DuplicateEntity ? `${VAL_SEPARATOR}copy:` + addItem.DuplicateEntity : '');
  return result;
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

  if (addItem.For != null) {
    const prefix = `${VAL_SEPARATOR}for:`;
    const forSuffix = buildForSuffix(addItem.For);
    if (addItem.For?.String)
      return l.r(`${prefix}s~${ParamEncoder.encode(addItem.For.String)}${forSuffix}`, "for string");
    if (addItem.For?.Number)
      return l.r(`${prefix}n~${addItem.For.Number}${forSuffix}`, "for number");
    if (addItem.For?.Guid)
      return l.r(`${prefix}g~${addItem.For.Guid}${forSuffix}`, "for guid");
  }
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
  const result = `${VAL_SEPARATOR}for:` + keyType + METADATA_SEPARATOR + toOrderedParams([
    ParamEncoder.encode(addItem.Metadata.key),
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
    result += `${VAL_SEPARATOR}${prefix}${key}~${ParamEncoder.encode(value.toString())}`;
  }
  return result;
}

function prefillFromUrlParams(url: string, addTo: Record<string, unknown>): Record<string, unknown> {
  const result = addTo ?? {} as Record<string, string>;
  if (url == null) return result;
  const prefillParams = url.split(LIST_SEPARATOR);
  const [key, value] = prefillParams[1].split(METADATA_SEPARATOR);
  const decodedValue = ParamEncoder.decode(value);
  result[key] = decodedValue;
  return result;
}

function fields2UrlParams(fields: string) {
  return fields ? `${VAL_SEPARATOR}${UIFIELDS_PREFIX}${ParamEncoder.encode(fields)}` : '';
}

function isNumber(maybeNumber: string): boolean {
  // The regex must be re-created for each test
  return /^-?[0-9]*$/g.test(maybeNumber);
}

export function convertUrlToForm(formUrl: string) {
  const l = log.fn("convertUrlToForm", { formUrl });
  const form: EditForm = { items: [] };
  const items = formUrl.split(ITEM_SEPARATOR);

  for (const item of items) {
    l.a("item", {item});
    // Handle group:
    if (item.startsWith(GROUP_PREFIX)) {
      // Inner Item / Group Item
      let innerItem = {} as ItemInListIdentifier;
      const options = item.split(VAL_SEPARATOR);

      for (const option of options) {
        if (option.startsWith(GROUP_PREFIX)) {
          const params = option.split(LIST_SEPARATOR);
          const hasParam5Id = params.length > 4 && params[5] && isNumber(params[5]);
          innerItem = {
            ...innerItem,
            Parent: params[1],
            Field: params[2],
            Index: parseInt(params[3], 10),
            Add: params[4] === 'true',
            ...(hasParam5Id && { EntityId: parseInt(params[5], 10) })
          }
          // innerItem.Parent = params[1];
          // innerItem.Field = params[2];
          // innerItem.Index = parseInt(params[3], 10);
          // innerItem.Add = params[4] === 'true';
          // if (hasParam5Id)
          //   innerItem.EntityId = parseInt(params[5], 10);
        } else if (option.startsWith('copy:')) {
          // Add Item Copy
          innerItem = {
            ...innerItem,
            DuplicateEntity: parseInt(option.split(LIST_SEPARATOR)[1], 10)
          };
          // innerItem.DuplicateEntity = parseInt(copyParams[1], 10);
        } else {
          innerItem = addParamToItemIdentifier(innerItem, option);
        }
      }
      form.items.push(innerItem);
    } else if (isNumber((item ?? '').split(VAL_SEPARATOR)[0])) {
      // Edit Item
      const parts = item.split(VAL_SEPARATOR);
      let editItem: ItemEditIdentifier = EditPrep.editId(parseInt(parts[0], 10));
      for (const part of parts)
        editItem = addParamToItemIdentifier(editItem, part);
      form.items.push(editItem);
    } else if (item.startsWith('new:')) {
      // Add Item
      let addItem = {} as ItemAddIdentifier;
      const options = item.split(VAL_SEPARATOR);

      for (const option of options) {
        if (option.startsWith('new:')) {
          // Add Item ContentType
          const newParams = option.split(LIST_SEPARATOR);
          addItem.ContentTypeName = newParams[1];
        } else if (option.startsWith('for:')) {
          // Add Item For
          const forParams = option.split(LIST_SEPARATOR);
          const [forKeyType, forKey] = forParams[1].split(METADATA_SEPARATOR);
          // const forTarget = forParams[2];
          // const forTargetType = parseInt(forParams[3], 10);
          const forSingleton = forParams[4] != null ? forParams[4] === 'true' : undefined;
          addItem.For = {
            Target: forParams[2],
            TargetType: parseInt(forParams[3], 10),
            ...(forKeyType === 'g' && { Guid: forKey }),
            ...(forKeyType === 'n' && { Number: parseInt(forKey, 10) }),
            ...(forKeyType === 's' && { String: ParamEncoder.decode(forKey) }),
            ...(forSingleton != null && { Singleton: forSingleton }),
          };
        } else if (option.startsWith('copy:')) {
          // Add Item Copy
          // const copyParams = option.split(LIST_SEPARATOR);
          // addItem.DuplicateEntity = parseInt(copyParams[1], 10);
          addItem = {
            ...addItem,
            DuplicateEntity: parseInt(option.split(LIST_SEPARATOR)[1], 10)
          };

        } else
          addItem = addParamToItemIdentifier(addItem, option);
      }
      form.items.push(addItem);
    }
  }
  return l.r(form);
}

/** add prefill and filter to url parameters */
function addParamToItemIdentifier<T extends ItemIdentifierShared>(item: T, part: string): T {
  const l = log.fn("addParamToItemIdentifier", {item, part});
  if (part.startsWith(UIFIELDS_PREFIX)) {
    const fields = ParamEncoder.decode(part.split(LIST_SEPARATOR)[1]);
    item.ClientData = { ...item.ClientData, fields };
    return l.rSilent(item);
  }
  // Add Item Prefill
  if (part.startsWith(PREFILL_PREFIX)) {
    item.Prefill = prefillFromUrlParams(part, item.Prefill);
    return l.rSilent(item);
  }
  // Add Item Form
  if (part.startsWith(PARAM_PREFIX)) {
    const formParams = prefillFromUrlParams(part, item.ClientData?.parameters);
    item.ClientData = { ...item.ClientData, parameters: formParams };
    return l.rSilent(item);
  }
  return l.rSilent(item, 'no match');
}

