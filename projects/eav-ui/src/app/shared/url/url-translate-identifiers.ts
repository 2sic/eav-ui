import { ItemAddIdentifier, ItemEditIdentifier, ItemIdentifierShared, ItemInListIdentifier } from '../models/edit-form.model';
import { ItemIdHelper } from '../models/item-id-helper';
import { PartCopyTranslator, PartMetadataTranslator, urlAddParamToItemIdentifier, urlAddTypicalParts, UrlPartDataTranslator } from './url-translate-parts';
import { SEPARATOR, toOrderedParams } from './url.constants';
import { UrlDataSpecs } from './url.models';

export interface UrlItemIdentifierTranslator {
  name: string;
  shouldEncode(item: ItemIdentifierShared): boolean;
  toUrl(item: ItemIdentifierShared, data: UrlDataSpecs): string;
  shouldDecode(item: string): boolean;
  fromUrl(item: string): ItemIdentifierShared;
}

function isNumber(maybeNumber: string): boolean {
  // The regex must be re-created for each test
  return /^-?[0-9]*$/g.test(maybeNumber);
}

class GroupTranslator implements UrlItemIdentifierTranslator {
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

    formUrl += urlAddTypicalParts(asGroup, data,
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
    const options = item.split(SEPARATOR.Val);

    const partCopy = new PartCopyTranslator();
    for (const option of options) {
      // The group prefix must always be the first option
      if (option.startsWith(GroupTranslator.GROUP_PREFIX)) {
        const params = option.split(SEPARATOR.List);
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
        innerItem = urlAddParamToItemIdentifier(innerItem, option);
    }
    return innerItem;
  }
}

class EditTranslator implements UrlItemIdentifierTranslator {
  public name = 'EditTranslator';

  shouldEncode(item: ItemIdentifierShared): boolean {
    return (item as ItemEditIdentifier).EntityId != null;
  }

  toUrl(asItem: ItemEditIdentifier, data: UrlDataSpecs): string {
    // Edit Item
    let formUrl = asItem.EntityId + '';

    // New: fields
    formUrl += urlAddTypicalParts(asItem, data,
      { fields: true, params: true }
    );
    return formUrl;
  }

  shouldDecode(item: string): boolean {
    const firstPart = item.split(SEPARATOR.Val)[0];
    return isNumber(firstPart);
  }

  fromUrl(item: string): ItemEditIdentifier {
    // Edit Item
    const parts = item.split(SEPARATOR.Val);
    let editItem: ItemEditIdentifier = ItemIdHelper.editId(parseInt(parts[0], 10));
    for (const part of parts)
      editItem = urlAddParamToItemIdentifier(editItem, part);
    return editItem;
  }
}

class AddTranslator implements UrlItemIdentifierTranslator {
  public name = 'AddTranslator';

  shouldEncode(item: ItemIdentifierShared): boolean {
    return (item as ItemAddIdentifier).ContentTypeName != null;
  }
  toUrl(addItem: ItemAddIdentifier, data: UrlDataSpecs): string {
    // Add Item
    let formUrl = 'new:' + addItem.ContentTypeName;

    // Save in JS, new v21 WIP
    const save = addItem.ClientData?.save;

    formUrl += urlAddTypicalParts(addItem, data,
      { metadata: true, prefill: true, fields: true, params: true, duplicate: true, save: save }
    );

    // Data
    formUrl += new UrlPartDataTranslator().add({ save: save }, addItem, data);

    return formUrl;
  }

  shouldDecode(item: string): boolean {
    return item.startsWith('new:');
  }

  fromUrl(item: string): ItemAddIdentifier {
    // Add Item
    let addItem = {} as ItemAddIdentifier;
    const options = item.split(SEPARATOR.Val);

    const partCopy = new PartCopyTranslator();
    const partMetadata = new PartMetadataTranslator();

    for (const option of options) {
      // the first part must always be the content type with the "new:" prefix
      if (option.startsWith('new:')) {
        // Add Item ContentType
        const newParams = option.split(SEPARATOR.List);
        addItem.ContentTypeName = newParams[1];
      } else if (partMetadata.shouldExtract(option))
        addItem = partMetadata.extract(addItem, option);
      else if (partCopy.shouldExtract(option))
        addItem = partCopy.extract(addItem, option);
      else
        addItem = urlAddParamToItemIdentifier(addItem, option);
    }
    return addItem;
  }
}


export const UrlItemIdentifierTranslators: UrlItemIdentifierTranslator[] = [
  new GroupTranslator(),
  new EditTranslator(),
  new AddTranslator()
];