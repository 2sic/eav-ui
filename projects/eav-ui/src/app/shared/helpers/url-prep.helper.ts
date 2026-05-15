import { classLog } from '../../../../../shared/logging';
import { EavFor } from '../../edit/shared/models/eav';
import { eavConstants } from '../constants/eav.constants';
import { EditForm, ItemAddIdentifier, ItemEditIdentifier, ItemIdentifier, ItemIdentifierInbound, ItemIdentifierShared, ItemInListIdentifier } from '../models/edit-form.model';
import { ItemIdHelper } from '../models/item-id-helper';
import { ParamEncoder } from './param-encoder';
import { UrlParamBase64 } from './url-param-base64';

// Note: everything in here is a bit magical - and probably not ideal
// It basically prepares a very compact url representation of an EditForm
// so it can be passed in urls
// The format is not documented anywhere - so changing it will likely break things
// so be careful!
// In some cases, order matters, in others there are prefixes to identify parts

const log = classLog("UrlPrepHelper")

const PREFILL_PREFIX = 'prefill:';
// const GROUP_PREFIX = 'group:';
const UIFIELDS_PREFIX = 'uifields:';
const PARAM_PREFIX = 'parameters:';
const COPY_PREFIX = 'copy:';
const SAVE_PREFIX = 'save:';
const DATA_PREFIX = 'data64:';
const ITEM_SEPARATOR = ',';
const VAL_SEPARATOR = '&';
const LIST_SEPARATOR = ':';
const METADATA_SEPARATOR = '~';

function toOrderedParams(values: unknown[]): string {
  return values.join(LIST_SEPARATOR);
}

interface UrlPartSpecs {
  fields: string | undefined;
  parameters: Record<string, unknown> | undefined;
}

export function convertFormToUrl(form: EditForm) {
  const l = log.fn('convertFormToUrl', { form });
  let formUrl = '';

  const translators: UrlTranslator[] = [
    new GroupTranslator(),
    new EditTranslator(),
    new AddTranslator()
  ];

  for (const item of form.items) {
    // If we already have one, the next must be separated
    if (formUrl)
      formUrl += ITEM_SEPARATOR;

    // const asGroup = item as ItemInListIdentifier;
    // const asItem = item as ItemEditIdentifier;
    // Fields/Parameters can come from two places
    // When a link is inbound from the page, it will use UiFields/Parameters
    // If it's from the Admin-UI itself, it should use the newer / deeper ClientData
    const asInboundParams = item as ItemIdentifierInbound;
    const specs = {
      fields: asInboundParams.UiFields ?? item.ClientData?.fields,
      parameters: asInboundParams.Parameters ?? item.ClientData?.parameters
    } satisfies UrlPartSpecs;

    for (const translator of translators) {
      if (translator.isForIdentifier(item)) {
        l.a(translator.name, {item});
        formUrl += translator.toUrl(item, specs);
        break;
      }
    }
  }
  return l.r(formUrl);
}

function addTypicalUrlGroups(
  item: ItemAddIdentifier | ItemEditIdentifier | ItemInListIdentifier,
  fields: string | undefined,
  parameters: Record<string, unknown> | undefined,
  parts: { metadata?: boolean, prefill?: boolean, fields?: boolean, params?: boolean, duplicate?: boolean, save?: string }
): string {
  const addItem = item as ItemAddIdentifier;
  const result = ''
    + (parts.metadata ? getParamForMetadata(addItem) : '')
    + (parts.prefill ? prefill2UrlParams(item.Prefill) : '')
    + (parts.fields ? fields2UrlParams(fields) : '')
    + (parts.params ? obj2UrlParams(parameters, PARAM_PREFIX) : '')
    + (parts.duplicate && addItem.DuplicateEntity ? `${VAL_SEPARATOR}${COPY_PREFIX}` + addItem.DuplicateEntity : '')
    + (parts.save ? `${VAL_SEPARATOR}${SAVE_PREFIX}${parts.save}` : '');
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
  const md = addItem.Metadata!;
  switch (md.keyType.toLocaleLowerCase()) {
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
    .find(m => m.targetType === md.targetType)?.target;
  const result = `${VAL_SEPARATOR}for:${keyType}${METADATA_SEPARATOR}` + toOrderedParams([
    ParamEncoder.encode(md.key),
    target,
    md.targetType
  ]);
  return l.r(result, result);
}

function prefill2UrlParams(prefill: Record<string, unknown> | undefined) {
  return obj2UrlParams(prefill, PREFILL_PREFIX);
}

function obj2UrlParams(obj: Record<string, unknown> | undefined, prefix: string) {
  let result = '';
  if (!obj)
    return result;
  for (const [key, value] of Object.entries(obj)) {
    if (value == null)
      continue;
    result += `${VAL_SEPARATOR}${prefix}${key}~${ParamEncoder.encode(value.toString())}`;
  }
  return result;
}

function prefillFromUrlParams(url: string, addTo: Record<string, unknown> | undefined): Record<string, unknown> {
  const result = addTo ?? {} as Record<string, string>;
  if (url == null)
    return result;
  const prefillParams = url.split(LIST_SEPARATOR);
  const [key, value] = prefillParams[1].split(METADATA_SEPARATOR);
  const decodedValue = ParamEncoder.decode(value);
  result[key] = decodedValue;
  return result;
}

function fields2UrlParams(fields: string | undefined) {
  return fields ? `${VAL_SEPARATOR}${UIFIELDS_PREFIX}${ParamEncoder.encode(fields)}` : '';
}

function isNumber(maybeNumber: string): boolean {
  // The regex must be re-created for each test
  return /^-?[0-9]*$/g.test(maybeNumber);
}

export function convertUrlToForm(formUrl: string) {
  const l = log.fn("convertUrlToForm", { formUrl });
  const itemPaths = formUrl.split(ITEM_SEPARATOR);

  const translators: UrlTranslator[] = [
    new GroupTranslator(),
    new EditTranslator(),
    new AddTranslator()
  ];

  const items = itemPaths
    .map(path => {
      for (const translator of translators)
        if (translator.isForString(path))
          return translator.fromUrl(path);
      l.a("No translator found for item path", {path});
      return null;
    })
    .filter(item => item != null) as ItemIdentifier[];
  return l.r({ items } satisfies EditForm);
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

  // Add Save mode new v21 WIP
  if (part.startsWith(SAVE_PREFIX)) {
    const save = part.split(LIST_SEPARATOR)[1] as 'js';
    item.ClientData = { ...item.ClientData, save };
    return l.rSilent(item);
  }

  // restore data new v21 WIP
  if (part.startsWith(DATA_PREFIX)) {
    const dataEncoded = part.split(LIST_SEPARATOR)[1];
    const data = UrlParamBase64.decode(dataEncoded);
    item.ClientData = { ...item.ClientData, data };
    return l.rSilent(item);
  }

  return l.rSilent(item, 'no match');
}

interface UrlTranslator {
  name: string;
  isForIdentifier(item: ItemIdentifierShared): boolean;
  toUrl(item: ItemIdentifierShared, parts: UrlPartSpecs): string;
  isForString(item: string): boolean;
  fromUrl(item: string): ItemIdentifierShared;
}

class GroupTranslator implements UrlTranslator {
  public static readonly GROUP_PREFIX = 'group:';

  public name = 'GroupTranslator';

  isForIdentifier(item: ItemIdentifierShared): boolean {
    return (item as ItemInListIdentifier).Parent != null;
  }

  toUrl(asGroup: ItemInListIdentifier, parts: UrlPartSpecs): string {
    let formUrl = GroupTranslator.GROUP_PREFIX + toOrderedParams([
      asGroup.Parent,
      asGroup.Field,
      asGroup.Index,
      asGroup.Add,
      asGroup.EntityId
    ]);

    formUrl += addTypicalUrlGroups(asGroup, parts.fields, parts.parameters,
      { prefill: true, fields: true, params: true, duplicate: true }
    );
    return formUrl;
  }

  isForString(item: string): boolean {
    return item.startsWith(GroupTranslator.GROUP_PREFIX);
  }

  fromUrl(item: string): ItemInListIdentifier {
    // Inner Item / Group Item
    let innerItem = {} as ItemInListIdentifier;
    const options = item.split(VAL_SEPARATOR);

    for (const option of options) {
      // The group prefix must always be the first option
      if (option.startsWith(GroupTranslator.GROUP_PREFIX)) {
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
      } else if (option.startsWith(COPY_PREFIX)) {
        // Add Item Copy
        innerItem = {
          ...innerItem,
          DuplicateEntity: parseInt(option.split(LIST_SEPARATOR)[1], 10)
        };
      } else {
        innerItem = addParamToItemIdentifier(innerItem, option);
      }
    }
    return innerItem;
  }
}

class EditTranslator implements UrlTranslator {
  public name = 'EditTranslator';

  isForIdentifier(item: ItemIdentifierShared): boolean {
    return (item as ItemEditIdentifier).EntityId != null;
  }

  toUrl(asItem: ItemEditIdentifier, parts: UrlPartSpecs): string {
    // Edit Item
    let formUrl = asItem.EntityId + '';

    // New: fields
    formUrl += addTypicalUrlGroups(asItem, parts.fields, parts.parameters,
      { fields: true, params: true }
    );
    return formUrl;
  }

  isForString(item: string): boolean {
    const firstPart = item.split(VAL_SEPARATOR)[0];
    return isNumber(firstPart);
  }

  fromUrl(item: string): ItemEditIdentifier {
    // Edit Item
    const parts = item.split(VAL_SEPARATOR);
    let editItem: ItemEditIdentifier = ItemIdHelper.editId(parseInt(parts[0], 10));
    for (const part of parts)
      editItem = addParamToItemIdentifier(editItem, part);
    return editItem;
  }
}

class AddTranslator implements UrlTranslator {
  public name = 'AddTranslator';

  isForIdentifier(item: ItemIdentifierShared): boolean {
    return (item as ItemAddIdentifier).ContentTypeName != null;
  }
  toUrl(addItem: ItemAddIdentifier, parts: UrlPartSpecs): string {
    // Add Item
    // const addItem = item as ItemAddIdentifier;
    let formUrl = 'new:' + addItem.ContentTypeName;

    // Save in JS, new v21 WIP
    const save = addItem.ClientData?.save;

    formUrl += addTypicalUrlGroups(addItem, parts.fields, parts.parameters,
      { metadata: true, prefill: true, fields: true, params: true, duplicate: true, save: save }
    );

    const overrideData = addItem.ClientData?.data;

    // console.log('2dm-convertFormToUrl - overrideData', { overrideData });

    if (overrideData)
      formUrl += `${VAL_SEPARATOR}${DATA_PREFIX}${UrlParamBase64.encode(overrideData)}`;
    return formUrl;
  }

  isForString(item: string): boolean {
    return item.startsWith('new:');
  }

  fromUrl(item: string): ItemAddIdentifier {
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
        const forSingleton = forParams[4] != null ? forParams[4] === 'true' : undefined;
        addItem.For = {
          Target: forParams[2],
          TargetType: parseInt(forParams[3], 10),
          ...(forKeyType === 'g' && { Guid: forKey }),
          ...(forKeyType === 'n' && { Number: parseInt(forKey, 10) }),
          ...(forKeyType === 's' && { String: ParamEncoder.decode(forKey) }),
          ...(forSingleton != null && { Singleton: forSingleton }),
        };
      } else if (option.startsWith(COPY_PREFIX)) {
        // Add Item Copy
        addItem = {
          ...addItem,
          DuplicateEntity: parseInt(option.split(LIST_SEPARATOR)[1], 10)
        };

      } else
        addItem = addParamToItemIdentifier(addItem, option);
    }
    return addItem;
  }
}