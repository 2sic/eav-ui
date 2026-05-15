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

interface UrlDataSpecs {
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

    // Fields/Parameters can come from two places
    // When a link is inbound from the page, it will use UiFields/Parameters
    // If it's from the Admin-UI itself, it should use the newer / deeper ClientData
    const asInboundParams = item as ItemIdentifierInbound;
    const data = {
      fields: asInboundParams.UiFields ?? item.ClientData?.fields,
      parameters: asInboundParams.Parameters ?? item.ClientData?.parameters
    } satisfies UrlDataSpecs;

    for (const translator of translators) {
      if (translator.shouldEncode(item)) {
        l.a(translator.name, {item});
        formUrl += translator.toUrl(item, data);
        break;
      }
    }
  }
  return l.r(formUrl);
}

interface AddPartsSpecs { metadata?: boolean, prefill?: boolean, fields?: boolean, params?: boolean, duplicate?: boolean, save?: string }

function addTypicalUrlGroups(
  item: ItemAddIdentifier | ItemEditIdentifier | ItemInListIdentifier,
  data: UrlDataSpecs,
  parts: AddPartsSpecs
): string {
  const addItem = item as ItemAddIdentifier;
  const result = ''
    + new PartMetadataTranslator().add(parts, addItem)
    + new PartPrefillTranslator().add(parts, item, data)
    + new PartFieldsTranslator().add(parts, item, data)
    + new PartParamsTranslator().add(parts, item, data)
    + new PartCopyTranslator().add(parts, addItem)
    + new PartSaveTranslator().add(parts, item);
  return result;
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
        if (translator.shouldDecode(path))
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
  const fieldsPart = new PartFieldsTranslator();
  if (fieldsPart.shouldExtract(part))
    return l.rSilent(fieldsPart.extract(item, part));

  // Add Item Prefill
  const partPrefill = new PartPrefillTranslator();
  if (partPrefill.shouldExtract(part))
    return l.rSilent(partPrefill.extract(item, part));

  // Add Item Form
  const partParams = new PartParamsTranslator();
  if (partParams.shouldExtract(part))
    return l.rSilent(partParams.extract(item, part));

  // Add Save mode new v21 WIP
  const savePart = new PartSaveTranslator();
  if (savePart.shouldExtract(part))
    return l.rSilent(savePart.extract(item, part));

  // restore data new v21 WIP
  const dataPart = new PartDataTranslator();
  if (dataPart.shouldExtract(part))
    return l.rSilent(dataPart.extract(item, part));

  return l.rSilent(item, 'no match');
}



interface PartTranslator {
  name: string;
  add(parts: AddPartsSpecs, item: ItemIdentifierShared, data: UrlDataSpecs): string;
  shouldExtract(part: string): boolean;
  extract<T extends ItemIdentifierShared>(item: T, part: string): T;
}

class PartSaveTranslator implements PartTranslator {
  public name = 'PartSaveTranslator';

  add(parts: AddPartsSpecs, item: ItemIdentifierShared, data?: UrlDataSpecs): string {
    return parts.save ? `${VAL_SEPARATOR}${SAVE_PREFIX}${parts.save}` : ''
  }

  shouldExtract(part: string): boolean {
    return part.startsWith(SAVE_PREFIX);
  }

  extract<T extends ItemIdentifierShared>(item: T, part: string): T {
    const save = part.split(LIST_SEPARATOR)[1] as 'js';
    return { ...item, ClientData: { ...item.ClientData, save } };
  }
}

class PartCopyTranslator implements PartTranslator {
  public name = 'PartCopyTranslator';

  add(parts: AddPartsSpecs, addItem: ItemAddIdentifier, data?: UrlDataSpecs): string {
    return (parts.duplicate && addItem.DuplicateEntity)
      ? `${VAL_SEPARATOR}${COPY_PREFIX}` + addItem.DuplicateEntity
      : '';
  }

  shouldExtract(part: string): boolean {
    return part.startsWith(COPY_PREFIX);
  }

  extract<T extends ItemIdentifierShared>(item: T, part: string): T {
    const duplicateEntity = parseInt(part.split(LIST_SEPARATOR)[1], 10);
    return {
      ...item,
      DuplicateEntity: duplicateEntity,
    };
  }
}

class PartParamsTranslator implements PartTranslator {
  public name = 'PartParamsTranslator';

  add(parts: AddPartsSpecs, item: ItemIdentifierShared, data: UrlDataSpecs): string {
    return parts.params ? obj2UrlParams(data.parameters, PARAM_PREFIX) : '';
  }

  shouldExtract(part: string): boolean {
    return part.startsWith(PARAM_PREFIX);
  }

  extract<T extends ItemIdentifierShared>(item: T, part: string): T {
    const formParams = prefillFromUrlParams(part, item.ClientData?.parameters);
    return { ...item, ClientData: { ...item.ClientData, parameters: formParams } };
  }
}

class PartFieldsTranslator implements PartTranslator {
  public name = 'PartFieldsTranslator';

  add(parts: AddPartsSpecs, item: ItemIdentifierShared, data: UrlDataSpecs): string {
    return parts.fields && data.fields
      ? `${VAL_SEPARATOR}${UIFIELDS_PREFIX}${ParamEncoder.encode(data.fields)}`
      : '';
  }

  shouldExtract(part: string): boolean {
    return part.startsWith(UIFIELDS_PREFIX);
  }

  extract<T extends ItemIdentifierShared>(item: T, part: string): T {
    const fields = ParamEncoder.decode(part.split(LIST_SEPARATOR)[1]);
    return { ...item, ClientData: { ...item.ClientData, fields } };
  }
}

class PartPrefillTranslator implements PartTranslator {
  public name = 'PartPrefillTranslator';

  add(parts: AddPartsSpecs, item: ItemIdentifierShared, data: UrlDataSpecs): string {
    return parts.prefill ? obj2UrlParams(item.Prefill, PREFILL_PREFIX) : '';
  }

  shouldExtract(part: string): boolean {
    return part.startsWith(PREFILL_PREFIX);
  }

  extract<T extends ItemIdentifierShared>(item: T, part: string): T {
    const prefill = prefillFromUrlParams(part, item.Prefill);
    return { ...item, Prefill: prefill };
  }
}

class PartMetadataTranslator implements PartTranslator {
  public name = 'PartMetadataTranslator';

  add(parts: AddPartsSpecs, addItem: ItemAddIdentifier, data?: UrlDataSpecs): string {
    return parts.metadata ? this.getParamForMetadata(addItem) : '';
  }

  shouldExtract(part: string): boolean {
    return part.startsWith(`for:`);
  }

  extract<T extends ItemIdentifierShared>(addItem: T, part: string): T {
    const forParams = part.split(LIST_SEPARATOR);
    const [forKeyType, forKey] = forParams[1].split(METADATA_SEPARATOR);
    const forSingleton = forParams[4] != null ? forParams[4] === 'true' : undefined;
    const For = {
      Target: forParams[2],
      TargetType: parseInt(forParams[3], 10),
      ...(forKeyType === 'g' && { Guid: forKey }),
      ...(forKeyType === 'n' && { Number: parseInt(forKey, 10) }),
      ...(forKeyType === 's' && { String: ParamEncoder.decode(forKey) }),
      ...(forSingleton != null && { Singleton: forSingleton }),
    };
    return {
      ...addItem,
      For,
    };
  }

  private getParamForMetadata(addItem: ItemAddIdentifier) {
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
      return l.r(this.getParamForOldMetadata(addItem), "metadata");
    return l.r('', "other");
  }

  private getParamForOldMetadata(addItem: ItemAddIdentifier) {
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
}


class PartDataTranslator implements PartTranslator {
  public name = 'PartDataTranslator';

  add(parts: AddPartsSpecs, item: ItemIdentifierShared, data?: UrlDataSpecs): string {
    const overrideData = item.ClientData?.data;
    if (!overrideData)
      return '';

    return `${VAL_SEPARATOR}${DATA_PREFIX}${UrlParamBase64.encode(overrideData)}`;
  }

  shouldExtract(part: string): boolean {
    return part.startsWith(DATA_PREFIX);
  }

  extract<T extends ItemIdentifierShared>(item: T, part: string): T {
    const dataEncoded = part.split(LIST_SEPARATOR)[1];
    const data = UrlParamBase64.decode(dataEncoded);
    return { ...item, ClientData: { ...item.ClientData, data } };
  }
}



interface UrlTranslator {
  name: string;
  shouldEncode(item: ItemIdentifierShared): boolean;
  toUrl(item: ItemIdentifierShared, data: UrlDataSpecs): string;
  shouldDecode(item: string): boolean;
  fromUrl(item: string): ItemIdentifierShared;
}

class GroupTranslator implements UrlTranslator {
  public static readonly GROUP_PREFIX = 'group:';

  public name = 'GroupTranslator';

  shouldEncode(item: ItemIdentifierShared): boolean {
    return (item as ItemInListIdentifier).Parent != null;
  }

  toUrl(asGroup: ItemInListIdentifier, data: UrlDataSpecs): string {
    let formUrl = GroupTranslator.GROUP_PREFIX + toOrderedParams([
      asGroup.Parent,
      asGroup.Field,
      asGroup.Index,
      asGroup.Add,
      asGroup.EntityId
    ]);

    formUrl += addTypicalUrlGroups(asGroup, data,
      { prefill: true, fields: true, params: true, duplicate: true }
    );
    return formUrl;
  }

  shouldDecode(item: string): boolean {
    return item.startsWith(GroupTranslator.GROUP_PREFIX);
  }

  fromUrl(item: string): ItemInListIdentifier {
    // Inner Item / Group Item
    let innerItem = {} as ItemInListIdentifier;
    const options = item.split(VAL_SEPARATOR);

    const partCopy = new PartCopyTranslator();
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
      } else if (partCopy.shouldExtract(option))
        innerItem = partCopy.extract(innerItem, option);
      else
        innerItem = addParamToItemIdentifier(innerItem, option);
    }
    return innerItem;
  }
}

class EditTranslator implements UrlTranslator {
  public name = 'EditTranslator';

  shouldEncode(item: ItemIdentifierShared): boolean {
    return (item as ItemEditIdentifier).EntityId != null;
  }

  toUrl(asItem: ItemEditIdentifier, data: UrlDataSpecs): string {
    // Edit Item
    let formUrl = asItem.EntityId + '';

    // New: fields
    formUrl += addTypicalUrlGroups(asItem, data,
      { fields: true, params: true }
    );
    return formUrl;
  }

  shouldDecode(item: string): boolean {
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

  shouldEncode(item: ItemIdentifierShared): boolean {
    return (item as ItemAddIdentifier).ContentTypeName != null;
  }
  toUrl(addItem: ItemAddIdentifier, data: UrlDataSpecs): string {
    // Add Item
    let formUrl = 'new:' + addItem.ContentTypeName;

    // Save in JS, new v21 WIP
    const save = addItem.ClientData?.save;

    formUrl += addTypicalUrlGroups(addItem, data,
      { metadata: true, prefill: true, fields: true, params: true, duplicate: true, save: save }
    );

    // Data
    formUrl += new PartDataTranslator().add({ save: save }, addItem, data);

    return formUrl;
  }

  shouldDecode(item: string): boolean {
    return item.startsWith('new:');
  }

  fromUrl(item: string): ItemAddIdentifier {
    // Add Item
    let addItem = {} as ItemAddIdentifier;
    const options = item.split(VAL_SEPARATOR);

    const partCopy = new PartCopyTranslator();
    const partMetadata = new PartMetadataTranslator();

    for (const option of options) {
      // the first part must always be the content type with the "new:" prefix
      if (option.startsWith('new:')) {
        // Add Item ContentType
        const newParams = option.split(LIST_SEPARATOR);
        addItem.ContentTypeName = newParams[1];
      } else if (partMetadata.shouldExtract(option))
        addItem = partMetadata.extract(addItem, option);
      else if (partCopy.shouldExtract(option))
        addItem = partCopy.extract(addItem, option);
      else
        addItem = addParamToItemIdentifier(addItem, option);
    }
    return addItem;
  }
}