import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { ScriptsLoaderService } from '../../../../shared/services/scripts-loader.service';
import { IconOption } from './string-font-icon-picker.models';
import { BaseComponent } from '../../base/base.component';
import { EavService } from '../../../../shared/services/eav.service';
import { calculateIconOptions } from './string-font-icon-picker.helpers';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-font-icon-picker',
  templateUrl: './string-font-icon-picker.component.html',
  styleUrls: ['./string-font-icon-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@InputType({
  wrapper: [WrappersConstants.EavLocalizationWrapper],
})
export class StringFontIconPickerComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  iconOptions$$ = new BehaviorSubject<IconOption[]>([]);
  filteredIcons$: Observable<IconOption[]>;
  previewCss$: Observable<string>;

  private subscription = new Subscription();

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    private scriptsLoaderService: ScriptsLoaderService,
  ) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.subscription.add(
      this.settings$.subscribe(settings => {
        const files: string = settings.Files || '';
        const cssPrefix: string = settings.CssPrefix || '';
        this.scriptsLoaderService.load(files.split('\n'), () => {
          const newIconOptions = calculateIconOptions(cssPrefix);
          this.iconOptions$$.next(newIconOptions);
        });
      })
    );
    this.previewCss$ = this.settings$.pipe(map(settings => settings.PreviewCss));
    this.filteredIcons$ = combineLatest([this.value$, this.iconOptions$$]).pipe(
      map(combined => {
        const value = combined[0];
        const iconOptions = combined[1];
        const filtered = iconOptions.filter(icon => icon.class.toLowerCase().includes(value.toLowerCase()));
        return filtered;
      }),
    );
  }

  ngOnDestroy() {
    this.iconOptions$$.complete();
    this.subscription.unsubscribe();
  }
}
