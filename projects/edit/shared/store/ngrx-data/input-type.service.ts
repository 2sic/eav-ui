import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InputType } from '../../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';

@Injectable({ providedIn: 'root' })
export class InputTypeService extends EntityCollectionServiceBase<InputType> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('InputType', serviceElementsFactory);
  }

  /** Add new input types to the store */
  addInputTypes(inputTypes: InputType[]): void {
    this.addManyToCache(inputTypes);
  }

  getAllInputTypes$(): Observable<InputType[]> {
    return this.entities$;
  }

  /** Get input type observable from the store */
  getInputTypeById(type: string): Observable<InputType> {
    return this.entities$.pipe(
      map(inputTypes => inputTypes.find(inputType => inputType.Type === type))
      // maybe add distinctUntilChanged()
    );
  }
}
