import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldSettings } from '../../../../edit-types';
import { FieldConfigGroup, FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldsSettingsService } from '../../../shared/services/fields-settings.service';
import { FieldsSettings2Service } from '../../../shared/services/fields-settings2.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { EmptyDefaultLogic } from './collapsible-wrapper-logic';

@Component({
  selector: 'app-collapsible-wrapper',
  templateUrl: './collapsible-wrapper.component.html',
  styleUrls: ['./collapsible-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollapsibleWrapperComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  fieldConfig: FieldConfigGroup;
  visibleInEditUI$: Observable<boolean>;
  collapse: boolean;
  label$: Observable<string>;
  notes$: Observable<string>;

  private settings$ = new BehaviorSubject<FieldSettings>(null);
  private subscription = new Subscription();

  constructor(
    private languageInstanceService: LanguageInstanceService,
    private fieldsSettingsService: FieldsSettingsService,
    private fieldsSettings2Service: FieldsSettings2Service,
  ) {
    EmptyDefaultLogic.importMe();
  }

  ngOnInit() {
    this.fieldConfig = this.config.field as FieldConfigGroup;

    const settings$ = this.fieldsSettings2Service.getFieldSettings$(this.fieldConfig.name);
    this.subscription.add(
      settings$.subscribe(settings => {
        this.settings$.next(settings);
      })
    );
    this.collapse = this.settings$.value.DefaultCollapsed;

    this.visibleInEditUI$ = this.settings$.pipe(map(settings => settings.VisibleInEditUI));
    this.label$ = this.settings$.pipe(map(settings => settings.Name));
    this.notes$ = this.settings$.pipe(map(settings => settings.Notes));

    this.subscription.add(
      combineLatest([
        this.languageInstanceService.getCurrentLanguage(this.config.form.formId),
        this.languageInstanceService.getDefaultLanguage(this.config.form.formId),
      ]).subscribe(([currentLanguage, defaultLanguage]) => {
        this.fieldsSettingsService.translateGroupSettingsAndValidation(this.fieldConfig, currentLanguage, defaultLanguage);
      })
    );
  }

  ngOnDestroy() {
    this.settings$.complete();
    this.subscription.unsubscribe();
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }
}
