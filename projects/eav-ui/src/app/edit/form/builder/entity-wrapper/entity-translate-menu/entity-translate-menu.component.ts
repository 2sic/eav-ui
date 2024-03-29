import { Component, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, map, Observable, Subscription } from 'rxjs';
import { TranslationState } from '../../../../shared/models/fields-configs.model';
import { EavService, FieldsSettingsService, FieldsTranslateService, FormsStateService } from '../../../../shared/services';
import { ItemService, LanguageInstanceService } from '../../../../shared/store/ngrx-data';
import { AutoTranslateDisabledWarningDialog } from '../../../wrappers/localization-wrapper/auto-translate-disabled-warning-dialog/auto-translate-disabled-warning-dialog.component';
import { AutoTranslateMenuDialogComponent } from '../../../wrappers/localization-wrapper/auto-translate-menu-dialog/auto-translate-menu-dialog.component';
import { TranslateMenuDialogData } from '../../../wrappers/localization-wrapper/translate-menu-dialog/translate-menu-dialog.models';
import { FieldConfigSet } from '../../fields-builder/field-config-set.model';
import { EntityTranslateMenuViewModel } from './entity-translate-menu.models';

@Component({
  selector: 'app-entity-translate-menu',
  templateUrl: './entity-translate-menu.component.html',
  styleUrls: ['./entity-translate-menu.component.scss'],
})
export class EntityTranslateMenuComponent implements OnInit, OnDestroy {
  @Input() entityGuid: string;

  viewModel$: Observable<EntityTranslateMenuViewModel>;
  autoTranslatableFields: string[];
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
    this.viewModel$ = combineLatest([readOnly$, slotIsEmpty$, currentLanguage$, defaultLanguage$]).pipe(
      map(([readOnly, slotIsEmpty, currentLanguage, defaultLanguage]) => {
        const viewModel: EntityTranslateMenuViewModel = {
          readOnly: readOnly.isReadOnly,
          slotIsEmpty,
          currentLanguage,
          defaultLanguage,
        };
        return viewModel;
      }),
    );
    this.autoTranslatableFields = this.fieldsTranslateService.findAutoTranslatableFields();
    if (this.autoTranslatableFields.length > 0)
      this.subscription = this.fieldsSettingsService.getTranslationState$(this.autoTranslatableFields[0]).subscribe(x => this.translationState = x);
  }

  translateMany() {
    this.fieldsTranslateService.translateMany();
  }

  autoTranslateMany(): void {
    if (this.autoTranslatableFields.length > 0) {
      const config: FieldConfigSet = {
        entityGuid: this.entityGuid,
        fieldName: this.autoTranslatableFields[0],
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
        translatableFields: this.autoTranslatableFields,
      };
      this.dialog.open(AutoTranslateMenuDialogComponent, {
        autoFocus: false,
        data: dialogData,
        viewContainerRef: this.viewContainerRef,
        width: '400px',
      });
    } else {
      this.dialog.open(AutoTranslateDisabledWarningDialog, {
        autoFocus: false,
        data: { isAutoTranslateAll: true },
        viewContainerRef: this.viewContainerRef,
        width: '400px',
      });
    }
  }

  dontTranslateMany() {
    this.fieldsTranslateService.dontTranslateMany();
  }

  ngOnDestroy(): void {
    if (this.autoTranslatableFields.length > 0)
      this.subscription.unsubscribe();
  }
}
