import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EavService, EditRoutingService, FieldsSettingsService } from '../../../shared/services';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data';
import { BaseComponent } from '../../input-types/base/base.component';
import { TranslateMenuComponent } from '../../localization/translate-menu/translate-menu.component';

@Component({
  selector: 'app-localization-wrapper',
  templateUrl: './localization-wrapper.component.html',
  styleUrls: ['./localization-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalizationWrapperComponent extends BaseComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(TranslateMenuComponent) private translateMenu: TranslateMenuComponent;

  currentLanguage$: Observable<string>;
  defaultLanguage$: Observable<string>;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private languageInstanceService: LanguageInstanceService,
    private editRoutingService: EditRoutingService,
  ) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    this.defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  translate() {
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    if (currentLanguage === defaultLanguage) { return; }
    if (!this.control.disabled) { return; }
    const isExpanded = this.editRoutingService.isExpanded(this.config.index, this.config.entityGuid);
    if (isExpanded) { return; }

    this.translateMenu.translate();
  }
}
