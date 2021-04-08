import { EavFor } from '../../../../../edit/shared/models/eav';
import { eavConstants } from '../constants/eav.constants';
import { AddItem, EditForm, EditItem, GroupItem, InnerItem } from '../models/edit-form.model';

export function convertFormToUrl(form: EditForm) {
  let formUrl = '';

  for (const item of form.items) {
    if (formUrl) { formUrl += ','; }

    if ((item as InnerItem).Parent) {
      // Inner Item
      const innerItem = item as InnerItem;
      formUrl += 'inner:' + innerItem.EntityId + ':' + innerItem.Field
        + ':' + innerItem.Parent + ':' + innerItem.Add + ':' + innerItem.Index;
      if (innerItem.Prefill) {
        for (const [key, prefill] of Object.entries(innerItem.Prefill)) {
          formUrl += '&prefill:' + key + '~' + paramEncode(prefill.toString());
        }
      }
    } else if ((item as EditItem).EntityId) {
      // Edit Item
      const editItem = item as EditItem;
      formUrl += editItem.EntityId;
    } else if ((item as AddItem).ContentTypeName) {
      // Add Item
      const addItem = item as AddItem;
      formUrl += 'new:' + addItem.ContentTypeName;

      // new v11.11 - support Singleton
      const createForSuffix = (mdFor: EavFor) => ':' + mdFor.Target
        + (mdFor.Singleton ? ':' + mdFor.Singleton.toString().toLowerCase() : '');

      if (addItem.For?.String) {
        formUrl += '&for:s~' + paramEncode(addItem.For.String) + createForSuffix(addItem.For);
      } else if (addItem.For?.Number) {
        formUrl += '&for:n~' + addItem.For.Number + createForSuffix(addItem.For);
      } else if (addItem.For?.Guid) {
        formUrl += '&for:g~' + addItem.For.Guid + createForSuffix(addItem.For);
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
        const target = Object.values(eavConstants.metadata).find(metaValue => metaValue.type === addItem.Metadata.targetType)?.target;
        formUrl += '&for:' + keyType + '~' + paramEncode(addItem.Metadata.key) + ':' + target;
      }

      if (addItem.Prefill) {
        for (const [key, prefill] of Object.entries(addItem.Prefill)) {
          formUrl += '&prefill:' + key + '~' + paramEncode(prefill.toString());
        }
      }

      if (addItem.DuplicateEntity) {
        formUrl += '&copy:' + addItem.DuplicateEntity;
      }
    } else if ((item as GroupItem).Group) {
      // Group Item
      const groupItem = item as GroupItem;
      formUrl += 'group:' + groupItem.Group.Guid + ':' + groupItem.Group.Index + ':' + groupItem.Group.Part + ':' + groupItem.Group.Add;
      if (groupItem.Prefill) {
        for (const [key, prefill] of Object.values(groupItem.Prefill)) {
          formUrl += '&prefill:' + key + '~' + paramEncode(prefill.toString());
        }
      }
    }
  }

  return formUrl;
}

export function convertUrlToForm(formUrl: string) {
  const form: EditForm = { items: [] };
  const items = formUrl.split(',');

  for (const item of items) {
    const isNumber = /^[0-9]*$/g;
    if (item.startsWith('inner:')) {
      // Inner Item
      const innerItem = {} as InnerItem;
      const options = item.split('&');

      for (const option of options) {
        if (option.startsWith('inner:')) {
          const innerItemParams = item.split(':');
          innerItem.EntityId = parseInt(innerItemParams[1], 10);
          innerItem.Field = innerItemParams[2];
          innerItem.Parent = innerItemParams[3];
          innerItem.Add = innerItemParams[4] === 'true';
          innerItem.Index = parseInt(innerItemParams[5], 10);
        } else if (option.startsWith('prefill:')) {
          if (innerItem.Prefill == null) {
            innerItem.Prefill = {};
          }
          const prefillParams = option.split(':');
          const key = prefillParams[1].split('~')[0];
          const value = paramDecode(prefillParams[1].split('~')[1]);
          innerItem.Prefill[key] = value;
        }
      }
      form.items.push(innerItem);
    } else if (isNumber.test(item)) {
      // Edit Item
      const editItem: EditItem = { EntityId: parseInt(item, 10) };
      form.items.push(editItem);
    } else if (item.startsWith('new:')) {
      // Add Item
      const addItem = {} as AddItem;
      const options = item.split('&');

      for (const option of options) {
        if (option.startsWith('new:')) {
          // Add Item ContentType
          const newParams = option.split(':');
          addItem.ContentTypeName = newParams[1];
        } else if (option.startsWith('for:')) {
          // Add Item For
          addItem.For = {} as EavFor;
          const forParams = option.split(':');
          const forIntro = forParams[1].split('~');
          const forType = forIntro[0];
          const forValue = forIntro[1];
          const forTarget = forParams[2];

          switch (forType) {
            case 's':
              addItem.For.String = paramDecode(forValue);
              break;
            case 'n':
              addItem.For.Number = parseInt(forValue, 10);
              break;
            case 'g':
              addItem.For.Guid = forValue;
              break;
          }
          // new v11.11 - Singleton Metadata
          if (forParams.length > 3) {
            addItem.For.Singleton = forParams[3] === 'true';
          }
          addItem.For.Target = forTarget;
        } else if (option.startsWith('prefill:')) {
          // Add Item Prefill
          if (addItem.Prefill == null) {
            addItem.Prefill = {};
          }
          const prefillParams = option.split(':');
          const key = prefillParams[1].split('~')[0];
          const value = paramDecode(prefillParams[1].split('~')[1]);
          addItem.Prefill[key] = value;
        } else if (option.startsWith('copy:')) {
          // Add Item Copy
          const copyParams = option.split(':');
          addItem.DuplicateEntity = parseInt(copyParams[1], 10);
        }
      }
      form.items.push(addItem);
    } else if (item.startsWith('group:')) {
      // Group Item
      const groupItem = {} as GroupItem;
      const options = item.split('&');

      for (const option of options) {
        if (option.startsWith('group:')) {
          // Group Item Group
          const groupParams = option.split(':');
          groupItem.Group = {
            Guid: groupParams[1],
            Index: parseInt(groupParams[2], 10),
            Part: groupParams[3],
            Add: groupParams[4] === 'true',
          };
        } else if (option.startsWith('prefill:')) {
          // Group Item Prefill
          if (groupItem.Prefill == null) {
            groupItem.Prefill = {};
          }
          const prefillParams = option.split(':');
          const key = prefillParams[1].split('~')[0];
          const value = paramDecode(prefillParams[1].split('~')[1]);
          groupItem.Prefill[key] = value;
        }
      }
      form.items.push(groupItem);
    }
  }

  return form;
}

/** Encodes characters in URL parameter to not mess up routing. Don't forget to decode it! :) */
function paramEncode(text: string) {
  text = text.replace(/\//g, '%2F');
  text = text.replace(/\:/g, '%3A');
  text = text.replace(/\&/g, '%26');
  text = text.replace(/\~/g, '%7E');
  text = text.replace(/\,/g, '%2C');
  return text;
}

/** Decodes characters in URL parameter */
function paramDecode(text: string) {
  text = text.replace(/%2F/g, '/');
  text = text.replace(/%3A/g, ':');
  text = text.replace(/%26/g, '&');
  text = text.replace(/%7E/g, '~');
  text = text.replace(/%2C/g, ',');
  return text;
}
