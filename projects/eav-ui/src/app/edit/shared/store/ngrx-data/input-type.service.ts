import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable } from 'rxjs';
import { InputType } from '../../../../content-type-fields/models/input-type.model';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class InputTypeService extends BaseDataService<InputType> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('InputType', serviceElementsFactory);
  }

  addInputTypes(inputTypes: InputType[]): void {
    this.addManyToCache(inputTypes);
  }

  getInputType(type: string): InputType {
    return this.cache$.value.find(inputType => inputType.Type === type);
  }

  getInputTypes(): InputType[] {
    return this.cache$.value;
  }

  getInputTypes$(): Observable<InputType[]> {
    return this.cache$.asObservable();
  }
}
