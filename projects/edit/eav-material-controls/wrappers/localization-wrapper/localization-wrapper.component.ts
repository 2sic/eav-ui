import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EavService } from '../../../shared/services/eav.service';
import { EditRoutingService } from '../../../shared/services/edit-routing.service';
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

  private isExpanded$ = new BehaviorSubject<boolean>(null);

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    private languageInstanceService: LanguageInstanceService,
    private editRoutingService: EditRoutingService,
  ) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.subscription.add(
      this.languageInstanceService.getCurrentLanguage(this.config.form.formId).subscribe(currentLanguage => {
        this.currentLanguage$.next(currentLanguage);
      })
    );
    this.subscription.add(
      this.languageInstanceService.getDefaultLanguage(this.config.form.formId).subscribe(defaultLanguage => {
        this.defaultLanguage$.next(defaultLanguage);
      })
    );
    this.subscription.add(
      this.editRoutingService.isExpanded(this.config.field.index, this.config.entity.entityGuid).subscribe(isExpanded => {
        this.isExpanded$.next(isExpanded);
      })
    );
  }

  ngOnDestroy() {
    this.currentLanguage$.complete();
    this.defaultLanguage$.complete();
    this.isExpanded$.complete();
    super.ngOnDestroy();
  }

  dblClickTranslate() {
    const translateEnabled = !this.isExpanded$.value && this.currentLanguage$.value !== this.defaultLanguage$.value;
    if (!translateEnabled) { return; }

    this.translateMenu.dblClickTranslate();
  }
}
