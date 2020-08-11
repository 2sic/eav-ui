import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, ChangeDetectionStrategy } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { EditRoutingService } from '../../../shared/services/edit-routing.service';
import { BaseComponent } from '../../input-types/base/base.component';
import { EavService } from '../../../shared/services/eav.service';
import { ValidationMessagesService } from '../../validators/validation-messages-service';

@Component({
  selector: 'app-eav-localization-wrapper',
  templateUrl: './eav-localization-wrapper.component.html',
  styleUrls: ['./eav-localization-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EavLocalizationComponent extends BaseComponent<any> implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  currentLanguage$: Observable<string>;
  defaultLanguage$: Observable<string>;
  open$: Observable<boolean>;
  toggleTranslateField$ = new BehaviorSubject(false);

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
    this.currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.config.form.formId);
    this.defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.config.form.formId);
    this.open$ = this.editRoutingService.isExpanded(this.config.field.index, this.config.entity.entityGuid);
  }

  ngOnDestroy() {
    this.toggleTranslateField$.complete();
    super.ngOnDestroy();
  }

  toggleTranslate() {
    let open: boolean;
    this.open$.pipe(take(1)).subscribe(isOpen => {
      open = isOpen;
    });
    let currentLanguage: string;
    this.currentLanguage$.pipe(take(1)).subscribe(lang => {
      currentLanguage = lang;
    });
    let defaultLanguage: string;
    this.defaultLanguage$.pipe(take(1)).subscribe(lang => {
      defaultLanguage = lang;
    });
    const toggleEnabled = !open && currentLanguage !== defaultLanguage;
    if (!toggleEnabled) { return; }

    this.toggleTranslateField$.next(!this.toggleTranslateField$.value);
  }
}
