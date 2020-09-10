import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService } from '../../../../shared/services/eav.service';
import { BaseComponent } from '../../base/base.component';
import { DropdownOption } from './string-dropdown.models';
import { calculateDropdownOptions } from './string-dropdown.helpers';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-dropdown',
  templateUrl: './string-dropdown.component.html',
  styleUrls: ['./string-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@InputType({
  wrapper: [WrappersConstants.EavLocalizationWrapper],
})
export class StringDropdownComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  enableTextEntry$: Observable<boolean>;
  dropdownOptions$: Observable<DropdownOption[]>;
  freeTextMode$: Observable<boolean>;
  private toggleFreeText$ = new BehaviorSubject(false);

  constructor(eavService: EavService, validationMessagesService: ValidationMessagesService) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.enableTextEntry$ = this.settings$.pipe(map(settings => settings.EnableTextEntry || false));
    this.dropdownOptions$ = combineLatest([this.value$, this.settings$]).pipe(
      map(([value, settings]) => {
        const dropdownOptions = calculateDropdownOptions(value, settings.DropdownValues);
        return dropdownOptions;
      }),
    );
    this.freeTextMode$ = combineLatest([this.enableTextEntry$, this.toggleFreeText$]).pipe(
      map(([enableTextEntry, freeTextMode]) => {
        if (!enableTextEntry) { return false; }
        return freeTextMode;
      }),
    );
  }

  ngOnDestroy() {
    this.toggleFreeText$.complete();
    super.ngOnDestroy();
  }

  toggleFreeTextMode() {
    this.toggleFreeText$.next(!this.toggleFreeText$.value);
  }
}
