import { EditForm, EditItem, AddItem, GroupItem } from '../models/edit-form.model';
import { EavFor } from '../../../../../edit/shared/models/eav';

export function convertFormToUrl(form: EditForm) {
  let formUrl = '';

  for (const item of form.items) {
    if (formUrl) { formUrl += ','; }

    if ((item as EditItem).EntityId) {
      // Edit Item
      const editItem = item as EditItem;
      formUrl += editItem.EntityId;
    } else if ((item as AddItem).ContentTypeName) {
      // Add Item
      const addItem = item as AddItem;
      formUrl += 'new:' + addItem.ContentTypeName;

      if (addItem.For?.String) {
        formUrl += '&for:s~' + paramEncode(addItem.For.String) + ':' + addItem.For.Target;
      } else if (addItem.For?.Number) {
        formUrl += '&for:n~' + addItem.For.Number + ':' + addItem.For.Target;
      } else if (addItem.For?.Guid) {
        formUrl += '&for:g~' + addItem.For.Guid + ':' + addItem.For.Target;
      }

      if (addItem.Prefill) {
        const keys = Object.keys(addItem.Prefill);
        for (const key of keys) {
          formUrl += '&prefill:' + key + '~' + paramEncode(addItem.Prefill[key]);
        }
      }

      if (addItem.DuplicateEntity) {
        formUrl += '&copy:' + addItem.DuplicateEntity;
      }
    } else if ((item as GroupItem).Group) {
      // Group Item
      const groupItem = item as GroupItem;
      formUrl += 'group:' + groupItem.Group.Guid + ':' + groupItem.Group.Index + ':' + groupItem.Group.Part + ':' + groupItem.Group.Add;
    }
  }

  return formUrl;
}

export function convertUrlToForm(formUrl: string) {
  const form: EditForm = { items: [] };
  const items = formUrl.split(',');

  for (const item of items) {
    const isNumber = /^[0-9]*$/g;
    if (isNumber.test(item)) {
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
          const forType = forParams[1].split('~')[0];
          const forValue = forParams[1].split('~')[1];
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
      const groupParams = item.split(':');
      const groupItem: GroupItem = {
        Group: {
          Guid: groupParams[1],
          Index: parseInt(groupParams[2], 10),
          Part: groupParams[3],
          Add: groupParams[4] === 'true',
        }
      };
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
  return text;
}

/** Decodes characters in URL parameter */
function paramDecode(text: string) {
  text = text.replace(/%2F/g, '/');
  text = text.replace(/%3A/g, ':');
  text = text.replace(/%26/g, '&');
  text = text.replace(/%7E/g, '~');
  return text;
}
