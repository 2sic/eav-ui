import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { BehaviorSubject, Observable } from 'rxjs';
import { Language } from '../../models';

@Injectable({ providedIn: 'root' })
export class LanguageService extends EntityCollectionServiceBase<Language> {
  private languages$: BehaviorSubject<Language[]>;

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Language', serviceElementsFactory);

    this.languages$ = new BehaviorSubject<Language[]>([]);
    // doesn't need to be completed because store services are singletons that lives as long as the browser tab is open
    this.entities$.subscribe(languages => {
      this.languages$.next(languages);
    });
  }

  loadLanguages(languages: Language[]): void {
    this.addAllToCache(languages);
  }

  getLanguages(): Language[] {
    return this.languages$.value;
  }

  getLanguages$(): Observable<Language[]> {
    return this.languages$.asObservable();
  }
}
