import { For1 } from '../json-format-v1';

export class EavFor {
  [key: string]: any;

  constructor(itemFor: For1) {
    Object.keys(itemFor).forEach(key => {
      if (itemFor.hasOwnProperty(key)) {
        this[key] = itemFor[key];
      }
    });
  }
}
