import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService } from '../../../../shared/services/eav.service';
import { ScriptsLoaderService } from '../../../../shared/services/scripts-loader.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { BaseComponent } from '../../base/base.component';
import { StringFontIconPickerLogic } from './string-font-icon-picker-logic';
import { findAllIconsInCss } from './string-font-icon-picker.helpers';
import { IconOption } from './string-font-icon-picker.models';

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
  iconOptions$ = new BehaviorSubject<IconOption[]>([]);
  filteredIcons$: Observable<IconOption[]>;
  previewCss$: Observable<string>;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    private scriptsLoaderService: ScriptsLoaderService,
  ) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    const settingsLogic = new StringFontIconPickerLogic();
    this.subscription.add(
      this.settings$.pipe(map(settings => settingsLogic.init(settings))).subscribe(settings => {
        const files = settings.Files;
        const cssPrefix = settings.CssPrefix;
        const showPrefix = settings.ShowPrefix;
        // load each file (usually CSS) in the settings
        this.scriptsLoaderService.load(files.split('\n'), () => {
          const newIconOptions = findAllIconsInCss(cssPrefix, showPrefix);
          this.iconOptions$.next(newIconOptions);
        });
      })
    );
    this.previewCss$ = this.settings$.pipe(map(settings => settings.PreviewCss));
    this.filteredIcons$ = combineLatest([this.value$, this.iconOptions$]).pipe(
      map(([search, iconList]) => {
        // if we have a filter param, use it, otherwise don't filter
        const filtered = search
          ? iconList.filter(icon => icon.search?.includes(search.toLowerCase()) ?? false)
          : iconList;
        return filtered;
      }),
    );
  }

  ngOnDestroy() {
    this.iconOptions$.complete();
    super.ngOnDestroy();
  }
}
