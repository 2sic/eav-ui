import { UpperCasePipe } from '@angular/common';
import { Component, computed, inject, input, signal, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureIconIndicatorComponent } from '../../../features/feature-icon-indicator/feature-icon-indicator.component';
import { UserLanguageService } from '../../../shared/services/user-language.service';
import { SignalEquals } from '../../../shared/signals/signal-equals';
import { TranslateMenuDialogComponent } from '../../fields/wrappers/localization/translate-menu-dialog/translate-menu-dialog';
import { TranslateMenuDialogConfig, TranslateMenuDialogData } from '../../fields/wrappers/localization/translate-menu-dialog/translate-menu-dialog.models';
import { FormConfigService } from '../../form/form-config.service';
import { FormsStateService } from '../../form/forms-state.service';
import { AutoTranslateDisabledWarningDialog } from '../../localization/auto-translate-disabled-warning-dialog/auto-translate-disabled-warning-dialog';
import { AutoTranslateMenuDialogComponent } from '../../localization/auto-translate-menu-dialog/auto-translate-menu-dialog';
import { TranslationState } from '../../localization/translate-state.model';
import { TranslationLinks } from '../../localization/translation-link.constants';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FieldsTranslateService } from '../../state/fields-translate.service';
import { ItemService } from '../../state/item.service';

@Component({
  selector: 'app-entity-translate-menu',
  templateUrl: './entity-translate-menu.html',
  styleUrls: ['./entity-translate-menu.scss'],
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    FeatureIconIndicatorComponent,
    UpperCasePipe,
    TranslateModule,
  ]
})
export class EntityTranslateMenuComponent {
  entityGuid = input<string>();

  private formsStateService = inject(FormsStateService);
  protected readOnly = this.formsStateService.readOnly;

  private userLanguageSvc = inject(UserLanguageService);

  // Initialize with a proper TranslationState so the signal satisfies the type
  translationState = signal<TranslationState>({
    infoLabel: '',
    infoMessage: '',
    linkType: TranslationLinks.Translate, // use an existing member from TranslationLinks
    language: '',
  });

  language = this.eavService.language;
  translatePrimaryLanguage = signal<boolean>(false);
  public isPrimaryLang = computed(() => this.language().current === this.language().primary);

  constructor(
    private matDialog: MatDialog,
    private itemService: ItemService,
    private eavService: FormConfigService,
    private fieldTranslateSvc: FieldsTranslateService,
    private viewContainerRef: ViewContainerRef,
    private fieldSettingsSvc: FieldsSettingsService,
  ) {
    // initialize translatePrimaryLanguage from persisted value
    this.translatePrimaryLanguage.set(this.userLanguageSvc.primaryTranslatableEnabled());
  }

  setTranslatePrimary(enabled: boolean) {
    this.translatePrimaryLanguage.set(!!enabled);
    this.userLanguageSvc.savePrimaryTranslatable(!!enabled);
  }

  #autoTranslatableFields = computed(() => {
    return this.fieldTranslateSvc.findAutoTranslatableFields();
  });

  protected slotIsEmpty = computed(() => {
    return this.itemService.slotIsEmpty(this.entityGuid())();
  }, SignalEquals.bool);

  unlockAll() {
    this.fieldTranslateSvc.toggleUnlockOnAll(true);
  }

  lockAll() {
    this.fieldTranslateSvc.toggleUnlockOnAll(false);
  }

  autoTranslateMany(): void {
    const autoTransFields = this.#autoTranslatableFields();
    if (autoTransFields.length === 0)
      return this.fieldTranslateSvc.showMessageNoTranslatableFields(true);

    // Translation state of any field, to detect the languages
    const translationStateAny = this.fieldSettingsSvc.translationState[autoTransFields[0]]();
    if (autoTransFields.length > 0) {
      const config: TranslateMenuDialogConfig = {
        entityGuid: this.entityGuid(),
        // intentionally no fieldName for "many" mode
      }
      const dialogData: TranslateMenuDialogData = {
        config,
        translationState: {
          language: translationStateAny.language,
          linkType: translationStateAny.linkType,
        },
        isTranslateMany: true,
        translatableFields: autoTransFields,
      };
      this.matDialog.open(AutoTranslateMenuDialogComponent, {
        autoFocus: false,
        data: dialogData,
        viewContainerRef: this.viewContainerRef,
        width: '400px',
      });
    } else {
      this.matDialog.open(AutoTranslateDisabledWarningDialog, {
        autoFocus: false,
        data: { isAutoTranslateAll: true },
        viewContainerRef: this.viewContainerRef,
        width: '400px',
      });
    }
  }

  /**
   * Open the translate dialog to "Link" many fields at once.
   * Gathers translatable fields from FieldsSettingsService and passes them as translatableFields.
   */
  openTranslateMenuDialogMany(): void {
    // gather fields we can operate on
    const allFieldKeys = Object.keys(this.fieldSettingsSvc.translationState);
    const translatableFields = allFieldKeys.filter(fn => {
      // fieldSettingsSvc.translationState[fn] is a Signal<TranslationState>
      const ts = this.fieldSettingsSvc.translationState[fn]?.();
      return !!ts; // include only fields that have a translationState object
    });

    if (translatableFields.length === 0) {
      return this.fieldTranslateSvc.showMessageNoTranslatableFields(true);
    }

    // pick a representative field state to provide default language/linkType for the dialog
    const translationStateAny = this.fieldSettingsSvc.translationState[translatableFields[0]]();

    // only pass the entity GUID in config for multi-field mode (no fieldName supplied)
    const config: TranslateMenuDialogConfig = {
      entityGuid: this.entityGuid(),
    };

    this.#openDialog(config, translationStateAny, translatableFields);
  }

  #openDialog(
    config: TranslateMenuDialogConfig,
    translationState: TranslationState,
    translatableFields: string[]
  ): void {
    const dialogData: TranslateMenuDialogData = {
      config,
      translationState: {
        language: translationState.language,
        linkType: translationState.linkType,
      },
      isTranslateMany: true,
      translatableFields,
    };

    this.matDialog.open(TranslateMenuDialogComponent, {
      autoFocus: false,
      data: dialogData,
      viewContainerRef: this.viewContainerRef,
      width: '400px',
    });
  }
}