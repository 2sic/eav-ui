import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { BehaviorSubject, Observable } from 'rxjs';
import { InputType } from '../../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';

@Injectable({ providedIn: 'root' })
export class InputTypeService extends EntityCollectionServiceBase<InputType> {
  private inputTypes$: BehaviorSubject<InputType[]>;

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('InputType', serviceElementsFactory);

    this.inputTypes$ = new BehaviorSubject<InputType[]>([]);
    // doesn't need to be completed because store services are singletons that live as long as the browser tab is open
    this.entities$.subscribe(inputTypes => {
      this.inputTypes$.next(inputTypes);
    });
  }

  addInputTypes(inputTypes: InputType[]): void {
    this.addManyToCache(inputTypes);
  }

  getInputType(type: string): InputType {
    return this.inputTypes$.value.find(inputType => inputType.Type === type);
  }

  getInputTypes(): InputType[] {
    return this.inputTypes$.value;
  }

  getInputTypes$(): Observable<InputType[]> {
    return this.inputTypes$.asObservable();
  }
}
