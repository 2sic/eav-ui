import { classLog } from '../../../../../shared/logging';
import { EavFor } from '../../edit/shared/models/eav';
import { eavConstants } from '../constants/eav.constants';
import { ItemAddIdentifier, ItemEditIdentifier, ItemIdentifierShared, ItemInListIdentifier } from '../models/edit-form.model';
import { ParamEncoder } from './param-encoder';
import { UrlParamBase64 } from './url-param-base64';
import { PREFIX, SEPARATOR, toOrderedParams } from './url.constants';
import { AddPartsSpecs, UrlDataSpecs } from './url.models';

const log = classLog("UrlPrepHelper")

export interface UrlPartTranslator {
  name: string;
  add(parts: AddPartsSpecs, item: ItemIdentifierShared, data: UrlDataSpecs): string;
  shouldExtract(part: string): boolean;
  extract<T extends ItemIdentifierShared>(item: T, part: string): T;
}

export function urlAddTypicalParts(
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


/** add prefill and filter to url parameters */
export function urlAddParamToItemIdentifier<T extends ItemIdentifierShared>(item: T, part: string): T {
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
  const dataPart = new UrlPartDataTranslator();
  if (dataPart.shouldExtract(part))
    return l.rSilent(dataPart.extract(item, part));

  return l.rSilent(item, 'no match');
}




class PartSaveTranslator implements UrlPartTranslator {
  public name = 'PartSaveTranslator';

  add(parts: AddPartsSpecs, item: ItemIdentifierShared, data?: UrlDataSpecs): string {
    return parts.save ? `${SEPARATOR.Val}${PREFIX.Save}${parts.save}` : ''
  }

  shouldExtract(part: string): boolean {
    return part.startsWith(PREFIX.Save);
  }

  extract<T extends ItemIdentifierShared>(item: T, part: string): T {
    const save = part.split(SEPARATOR.List)[1] as 'js';
    return { ...item, ClientData: { ...item.ClientData, save } };
  }
}



export class PartCopyTranslator implements UrlPartTranslator {
  public name = 'PartCopyTranslator';

  add(parts: AddPartsSpecs, addItem: ItemAddIdentifier, data?: UrlDataSpecs): string {
    return (parts.duplicate && addItem.DuplicateEntity)
      ? `${SEPARATOR.Val}${PREFIX.Copy}` + addItem.DuplicateEntity
      : '';
  }

  shouldExtract(part: string): boolean {
    return part.startsWith(PREFIX.Copy);
  }

  extract<T extends ItemIdentifierShared>(item: T, part: string): T {
    const duplicateEntity = parseInt(part.split(SEPARATOR.List)[1], 10);
    return {
      ...item,
      DuplicateEntity: duplicateEntity,
    };
  }
}



class PartParamsTranslator implements UrlPartTranslator {
  public name = 'PartParamsTranslator';

  add(parts: AddPartsSpecs, item: ItemIdentifierShared, data: UrlDataSpecs): string {
    return parts.params ? obj2UrlParams(data.parameters, PREFIX.Params) : '';
  }

  shouldExtract(part: string): boolean {
    return part.startsWith(PREFIX.Params);
  }

  extract<T extends ItemIdentifierShared>(item: T, part: string): T {
    const formParams = prefillFromUrlParams(part, item.ClientData?.parameters);
    return { ...item, ClientData: { ...item.ClientData, parameters: formParams } };
  }
}



class PartFieldsTranslator implements UrlPartTranslator {
  public name = 'PartFieldsTranslator';

  add(parts: AddPartsSpecs, item: ItemIdentifierShared, data: UrlDataSpecs): string {
    return parts.fields && data.fields
      ? `${SEPARATOR.Val}${PREFIX.UiFields}${ParamEncoder.encode(data.fields)}`
      : '';
  }

  shouldExtract(part: string): boolean {
    return part.startsWith(PREFIX.UiFields);
  }

  extract<T extends ItemIdentifierShared>(item: T, part: string): T {
    const fields = ParamEncoder.decode(part.split(SEPARATOR.List)[1]);
    return { ...item, ClientData: { ...item.ClientData, fields } };
  }
}



class PartPrefillTranslator implements UrlPartTranslator {
  public name = 'PartPrefillTranslator';

  add(parts: AddPartsSpecs, item: ItemIdentifierShared, data: UrlDataSpecs): string {
    return parts.prefill ? obj2UrlParams(item.Prefill, PREFIX.Prefill) : '';
  }

  shouldExtract(part: string): boolean {
    return part.startsWith(PREFIX.Prefill);
  }

  extract<T extends ItemIdentifierShared>(item: T, part: string): T {
    const prefill = prefillFromUrlParams(part, item.Prefill);
    return { ...item, Prefill: prefill };
  }
}



export class PartMetadataTranslator implements UrlPartTranslator {
  public name = 'PartMetadataTranslator';

  add(parts: AddPartsSpecs, addItem: ItemAddIdentifier, data?: UrlDataSpecs): string {
    return parts.metadata ? this.getParamForMetadata(addItem) : '';
  }

  shouldExtract(part: string): boolean {
    return part.startsWith(`for:`);
  }

  extract<T extends ItemIdentifierShared>(addItem: T, part: string): T {
    const forParams = part.split(SEPARATOR.List);
    const [forKeyType, forKey] = forParams[1].split(SEPARATOR.Metadata);
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
      const prefix = `${SEPARATOR.Val}for:`;
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
    const result = `${SEPARATOR.Val}for:${keyType}${SEPARATOR.Metadata}` + toOrderedParams([
      ParamEncoder.encode(md.key),
      target,
      md.targetType
    ]);
    return l.r(result, result);
  }
}



export class UrlPartDataTranslator implements UrlPartTranslator {
  public name = 'UrlPartDataTranslator';

  add(parts: AddPartsSpecs, item: ItemIdentifierShared, data?: UrlDataSpecs): string {
    const overrideData = item.ClientData?.data;
    if (!overrideData)
      return '';

    return `${SEPARATOR.Val}${PREFIX.Data}${UrlParamBase64.encode(overrideData)}`;
  }

  shouldExtract(part: string): boolean {
    return part.startsWith(PREFIX.Data);
  }

  extract<T extends ItemIdentifierShared>(item: T, part: string): T {
    const dataEncoded = part.split(SEPARATOR.List)[1];
    const data = UrlParamBase64.decode(dataEncoded);
    return { ...item, ClientData: { ...item.ClientData, data } };
  }
}






function obj2UrlParams(obj: Record<string, unknown> | undefined, prefix: string) {
  let result = '';
  if (!obj)
    return result;
  for (const [key, value] of Object.entries(obj)) {
    if (value == null)
      continue;
    result += `${SEPARATOR.Val}${prefix}${key}${SEPARATOR.Metadata}${ParamEncoder.encode(value.toString())}`;
  }
  return result;
}


function prefillFromUrlParams(url: string, addTo: Record<string, unknown> | undefined): Record<string, unknown> {
  const result = addTo ?? {} as Record<string, string>;
  if (url == null)
    return result;
  const prefillParams = url.split(SEPARATOR.List);
  const [key, value] = prefillParams[1].split(SEPARATOR.Metadata);
  const decodedValue = ParamEncoder.decode(value);
  result[key] = decodedValue;
  return result;
}