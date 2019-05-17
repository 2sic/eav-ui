import { EavFor } from '../eav';

export class For1 {
  [key: string]: any;

  constructor(entityFor: EavFor) {
    Object.keys(entityFor).forEach(key => {
      if (entityFor.hasOwnProperty(key)) {
        this[key] = entityFor[key];
      }
    });
  }
}
