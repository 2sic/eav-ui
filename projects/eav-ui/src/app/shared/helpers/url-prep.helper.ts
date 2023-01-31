import { EavFor } from '../../edit/shared/models/eav';
import { eavConstants } from '../constants/eav.constants';
import { EditForm, ItemAddIdentifier, ItemEditIdentifier, ItemInListIdentifier } from '../models/edit-form.model';

const PREFILL_PREFIX = 'prefill:';
const GROUP_PREFIX = 'group:';
const ITEM_SEPARATOR = ',';

function toOrderedParams(values: unknown[]): string {
  return values.join(':');
}

export function convertFormToUrl(form: EditForm) {
  let formUrl = '';

  for (const item of form.items) {
    // If we already have one, the next must be separated
    if (formUrl) formUrl += ITEM_SEPARATOR;

    const groupItem = item as ItemInListIdentifier;
    const editItem = item as ItemEditIdentifier;
    // Group- or Inner-Item
    if (groupItem.Parent) {
      formUrl += GROUP_PREFIX + toOrderedParams([
        groupItem.Parent,
        groupItem.Field,
        groupItem.Index,
        groupItem.Add,
        groupItem.EntityId
      ]);
      formUrl += prefill2UrlParams(groupItem.Prefill);

    } else if (editItem.EntityId) {
      // Edit Item
      formUrl += editItem.EntityId;

    } else if ((item as ItemAddIdentifier).ContentTypeName) {
      // Add Item
      const addItem = item as ItemAddIdentifier;
      formUrl += 'new:' + addItem.ContentTypeName;

      const buildForSuffix = (itemFor: EavFor) => toOrderedParams([
          '', // empty string to ensure it will start with a ":"
          itemFor.Target,
          itemFor.TargetType,
          (itemFor.Singleton ? itemFor.Singleton.toString() : '')
        ]);

      if (addItem.For?.String) {
        formUrl += '&for:s~' + paramEncode(addItem.For.String) + buildForSuffix(addItem.For);
      } else if (addItem.For?.Number) {
        formUrl += '&for:n~' + addItem.For.Number + buildForSuffix(addItem.For);
      } else if (addItem.For?.Guid) {
        formUrl += '&for:g~' + addItem.For.Guid + buildForSuffix(addItem.For);
      } else if (addItem.Metadata) {
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
        formUrl += '&for:' + keyType + '~' + toOrderedParams([
          paramEncode(addItem.Metadata.key),
          target,
          addItem.Metadata.targetType
        ]);
      }

      formUrl += prefill2UrlParams(addItem.Prefill);

      if (addItem.DuplicateEntity) formUrl += '&copy:' + addItem.DuplicateEntity;
    }
  }

  return formUrl;
}

function prefill2UrlParams(prefill: Record<string, string>) {
  let result = '';
  if (!prefill) return result;
  for (const [key, value] of Object.entries(prefill)) {
    if (value == null) { continue; }
    result += `&${PREFILL_PREFIX}` + key + '~' + paramEncode(value.toString());
  }
  return result;
}

function prefillFromUrlParams(url: string, addTo: Record<string, string>): Record<string, string> {
  const result = addTo ?? {} as Record<string, string>;
  if (url == null) return result;
  const prefillParams = url.split(':');
  const key = prefillParams[1].split('~')[0];
  const value = paramDecode(prefillParams[1].split('~')[1]);
  result[key] = value;
  return result;
}

function isNumber(maybeNumber: string): boolean {
  // The regex must be re-created for each test
  return /^[0-9]*$/g.test(maybeNumber);
}

export function convertUrlToForm(formUrl: string) {
  const form: EditForm = { items: [] };
  const items = formUrl.split(ITEM_SEPARATOR);

  for (const item of items) {
    if (item.startsWith(GROUP_PREFIX)) {
      // Inner Item / Group Item
      const innerItem = {} as ItemInListIdentifier;
      const options = item.split('&');

      for (const option of options) {
        if (option.startsWith(GROUP_PREFIX)) {
          const parms = option.split(':');
          innerItem.Parent = parms[1];
          innerItem.Field = parms[2];
          innerItem.Index = parseInt(parms[3], 10);
          innerItem.Add = parms[4] === 'true';
          if (parms.length > 4 && parms[5] && isNumber(parms[5]))
            innerItem.EntityId = parseInt(parms[5], 10);
        } else if (option.startsWith(PREFILL_PREFIX)) {
          innerItem.Prefill = prefillFromUrlParams(option, innerItem.Prefill);
        }
      }
      form.items.push(innerItem);
    } else if (isNumber(item)) {
      // Edit Item
      const editItem: ItemEditIdentifier = { EntityId: parseInt(item, 10) };
      form.items.push(editItem);
    } else if (item.startsWith('new:')) {
      // Add Item
      const addItem = {} as ItemAddIdentifier;
      const options = item.split('&');

      for (const option of options) {
        if (option.startsWith('new:')) {
          // Add Item ContentType
          const newParams = option.split(':');
          addItem.ContentTypeName = newParams[1];
        } else if (option.startsWith('for:')) {
          // Add Item For
          const forParams = option.split(':');
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
        } else if (option.startsWith(PREFILL_PREFIX)) {
          // Add Item Prefill
          addItem.Prefill = prefillFromUrlParams(option, addItem.Prefill);
        } else if (option.startsWith('copy:')) {
          // Add Item Copy
          const copyParams = option.split(':');
          addItem.DuplicateEntity = parseInt(copyParams[1], 10);
        }
      }
      form.items.push(addItem);
    }
  }
  return form;
}

/** Encodes characters in URL parameter to not mess up routing. Don't forget to decode it! :) */
function paramEncode(text: string) {
  return text
    .replace(/\//g, '%2F')
    .replace(/\:/g, '%3A')
    .replace(/\&/g, '%26')
    .replace(/\~/g, '%7E')
    .replace(/\,/g, '%2C');
}

/** Decodes characters in URL parameter */
function paramDecode(text: string) {
  return text
    .replace(/%2F/g, '/')
    .replace(/%3A/g, ':')
    .replace(/%26/g, '&')
    .replace(/%7E/g, '~')
    .replace(/%2C/g, ',');
}
