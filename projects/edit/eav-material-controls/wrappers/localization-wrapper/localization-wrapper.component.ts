import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EavService } from '../../../shared/services/eav.service';
import { EditRoutingService } from '../../../shared/services/edit-routing.service';
import { FieldsSettings2NewService } from '../../../shared/services/fields-settings2new.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { BaseComponent } from '../../input-types/base/base.component';
import { TranslateMenuComponent } from '../../localization/translate-menu/translate-menu.component';
import { ValidationMessagesService } from '../../validators/validation-messages-service';

@Component({
  selector: 'app-localization-wrapper',
  templateUrl: './localization-wrapper.component.html',
  styleUrls: ['./localization-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalizationWrapperComponent extends BaseComponent<any> implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(TranslateMenuComponent) private translateMenu: TranslateMenuComponent;

  currentLanguage$ = new BehaviorSubject<string>(null);
  defaultLanguage$ = new BehaviorSubject<string>(null);

  private isDisabled$ = new BehaviorSubject<boolean>(null);
  private isExpanded$ = new BehaviorSubject<boolean>(null);

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettings2NewService: FieldsSettings2NewService,
    private languageInstanceService: LanguageInstanceService,
    private editRoutingService: EditRoutingService,
  ) {
    super(eavService, validationMessagesService, fieldsSettings2NewService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.subscription.add(
      this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId).subscribe(currentLanguage => {
        this.currentLanguage$.next(currentLanguage);
      })
    );
    this.subscription.add(
      this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId).subscribe(defaultLanguage => {
        this.defaultLanguage$.next(defaultLanguage);
      })
    );
    this.subscription.add(
      this.editRoutingService.isExpanded(this.config.field.index, this.config.entityGuid).subscribe(isExpanded => {
        this.isExpanded$.next(isExpanded);
      })
    );
    this.subscription.add(
      this.disabled$.subscribe(disabled => {
        this.isDisabled$.next(disabled);
      })
    );
  }

  ngOnDestroy() {
    this.currentLanguage$.complete();
    this.defaultLanguage$.complete();
    this.isDisabled$.complete();
    this.isExpanded$.complete();
    super.ngOnDestroy();
  }

  translate() {
    if (this.currentLanguage$.value === this.defaultLanguage$.value) { return; }
    if (!this.isDisabled$.value) { return; }
    if (this.isExpanded$.value) { return; }

    this.translateMenu.translate();
  }
}
