import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { map } from 'rxjs/operators';
import { InputType } from '../../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';

@Injectable({ providedIn: 'root' })
export class InputTypeService extends EntityCollectionServiceBase<InputType> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('InputType', serviceElementsFactory);
  }

  /** Add new input types to the store */
  addInputTypes(inputTypes: InputType[]) {
    this.addManyToCache(inputTypes);
  }

  /** Get input type observable from the store */
  getInputTypeById(type: string) {
    return this.entities$.pipe(
      map(inputTypes => inputTypes.find(inputType => inputType.Type === type))
      // maybe add distinctUntilChanged()
    );
  }
}
