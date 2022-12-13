import { Component, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, map, Observable, Subscription } from 'rxjs';
import { TranslationState } from '../../../../shared/models/fields-configs.model';
import { EavService, FieldsSettingsService, FieldsTranslateService, FormsStateService } from '../../../../shared/services';
import { ItemService, LanguageInstanceService } from '../../../../shared/store/ngrx-data';
import { TranslateFromMenuDialogComponent } from '../../../wrappers/localization-wrapper/translate-from-menu-dialog/translate-from-menu-dialog.component';
import { TranslateMenuDialogData } from '../../../wrappers/localization-wrapper/translate-menu-dialog/translate-menu-dialog.models';
import { FieldConfigSet } from '../../fields-builder/field-config-set.model';
import { EntityTranslateMenuTemplateVars } from './entity-translate-menu.models';

@Component({
  selector: 'app-entity-translate-menu',
  templateUrl: './entity-translate-menu.component.html',
  styleUrls: ['./entity-translate-menu.component.scss'],
})
export class EntityTranslateMenuComponent implements OnInit, OnDestroy {
  @Input() entityGuid: string;

  templateVars$: Observable<EntityTranslateMenuTemplateVars>;
  translatableFields: string[];
  translationState: TranslationState;
  private subscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private eavService: EavService,
    private fieldsTranslateService: FieldsTranslateService,
    private formsStateService: FormsStateService,
    private viewContainerRef: ViewContainerRef,
    private fieldsSettingsService: FieldsSettingsService,
  ) { }

  ngOnInit() {
    const readOnly$ = this.formsStateService.readOnly$;
    const slotIsEmpty$ = this.itemService.getItemHeader$(this.entityGuid).pipe(
      map(header => !header.IsEmptyAllowed ? false : header.IsEmpty),
    );
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);
    this.templateVars$ = combineLatest([readOnly$, slotIsEmpty$, currentLanguage$, defaultLanguage$]).pipe(
      map(([readOnly, slotIsEmpty, currentLanguage, defaultLanguage]) => {
        const templateVars: EntityTranslateMenuTemplateVars = {
          readOnly: readOnly.isReadOnly,
          slotIsEmpty,
          currentLanguage,
          defaultLanguage,
        };
        return templateVars;
      }),
    );
    this.translatableFields = this.fieldsTranslateService.findTranslatableFields();
    this.subscription = this.fieldsSettingsService.getTranslationState$(this.translatableFields[0]).subscribe(x => this.translationState = x);
  }

  translateMany() {
    this.fieldsTranslateService.translateMany();
  }

  translateFromMany(): void {
    const config: FieldConfigSet = {
      entityGuid: this.entityGuid,
      fieldName: this.translatableFields[0],
      name: '',
      focused$: undefined
    }
    const dialogData: TranslateMenuDialogData = {
      config: config,
      translationState: {
        language: this.translationState.language,
        linkType: this.translationState.linkType,
      },
      isTranslateMany: true,
      translatableFields: this.translatableFields,
    };
    this.dialog.open(TranslateFromMenuDialogComponent, {
      autoFocus: false,
      data: dialogData,
      panelClass: 'translate-menu-dialog',
      viewContainerRef: this.viewContainerRef,
      width: '350px',
    });
  }

  dontTranslateMany() {
    this.fieldsTranslateService.dontTranslateMany();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
