import { Component, computed, inject, input, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ItemService } from '../../shared/store/ngrx-data';
import { AutoTranslateDisabledWarningDialog } from '../../localization/auto-translate-disabled-warning-dialog/auto-translate-disabled-warning-dialog.component';
import { AutoTranslateMenuDialogComponent } from '../../localization/auto-translate-menu-dialog/auto-translate-menu-dialog.component';
import { TranslateMenuDialogConfig, TranslateMenuDialogData } from '../../fields/wrappers/localization/translate-menu-dialog/translate-menu-dialog.models';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { FeatureIconIndicatorComponent } from '../../../features/feature-icon-indicator/feature-icon-indicator.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FieldsTranslateService } from '../../state/fields-translate.service';
import { FormConfigService } from '../../state/form-config.service';
import { FormsStateService } from '../../state/forms-state.service';
import { SignalHelpers } from '../../../shared/helpers/signal.helpers';

@Component({
  selector: 'app-entity-translate-menu',
  templateUrl: './entity-translate-menu.component.html',
  styleUrls: ['./entity-translate-menu.component.scss'],
  standalone: true,
  imports: [
    FlexModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    FeatureIconIndicatorComponent,
    AsyncPipe,
    UpperCasePipe,
    TranslateModule,
  ],
})
export class EntityTranslateMenuComponent {
  entityGuid = input<string>();

  private formsStateService = inject(FormsStateService);
  protected readOnly = this.formsStateService.readOnly;

  constructor(
    private dialog: MatDialog,
    private itemService: ItemService,
    private eavService: FormConfigService,
    private fieldsTranslateService: FieldsTranslateService,
    private viewContainerRef: ViewContainerRef,
    private fieldsSettingsService: FieldsSettingsService,
  ) {
    // debug...
    // effect(() => {
    //   console.log(`2dm ${this.entityGuid()} slotIsEmpty:` + this.slotIsEmpty());
    //   console.log(`2dm autoTranslatableFields:` + this.#autoTranslatableFields());
    // });
  }

  #autoTranslatableFields = computed(() => {
    // console.log(`2dm #AutoTrans:`, val, (this.fieldsTranslateService as any).entityGuid);
    return this.fieldsTranslateService.findAutoTranslatableFields();
  });

  protected slotIsEmpty = computed(() => {
    return this.itemService.slotIsEmpty(this.entityGuid())();
  }, SignalHelpers.boolEquals);

  language = this.eavService.languageSignal;

  translateMany() {
    this.fieldsTranslateService.translateMany();
  }

  autoTranslateMany(): void {
    const autoTransFields = this.#autoTranslatableFields();
    const transStateForLanguages = this.fieldsSettingsService.getTranslationStateNow(this.#autoTranslatableFields()[0]);
    if (autoTransFields.length > 0) {
      const config: TranslateMenuDialogConfig = {
        entityGuid: this.entityGuid(),
        fieldName: autoTransFields[0],
        // name: '',
        // focused$: undefined
      }
      const dialogData: TranslateMenuDialogData = {
        config,
        translationState: {
          language: transStateForLanguages.language,
          linkType: transStateForLanguages.linkType,
        },
        isTranslateMany: true,
        translatableFields: autoTransFields,
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

}
