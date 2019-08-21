import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { InputType } from '../../models/eav';

@Injectable({ providedIn: 'root' })
export class InputTypeService extends EntityCollectionServiceBase<InputType> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('InputType', serviceElementsFactory);
  }

  public loadInputTypes(inputTypes: InputType[]) {
    this.addAllToCache(inputTypes);
  }

  /** Add new input types to the store */
  public addInputTypes(inputTypes: InputType[]) {
    this.addManyToCache(inputTypes);
  }

  /** Get input type observable from the store */
  public getInputTypeById(type: string): Observable<InputType> {
    return this.entities$.pipe(
      map(inputTypes => inputTypes.find(inputType => inputType.Type === type))
    );
  }
}
