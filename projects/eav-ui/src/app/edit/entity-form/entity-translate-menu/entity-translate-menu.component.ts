import { UpperCasePipe } from '@angular/common';
import { Component, computed, inject, input, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureIconIndicatorComponent } from '../../../features/feature-icon-indicator/feature-icon-indicator.component';
import { SignalEquals } from '../../../shared/signals/signal-equals';
import { TranslateMenuDialogConfig, TranslateMenuDialogData } from '../../fields/wrappers/localization/translate-menu-dialog/translate-menu-dialog.models';
import { FormConfigService } from '../../form/form-config.service';
import { FormsStateService } from '../../form/forms-state.service';
import { AutoTranslateDisabledWarningDialog } from '../../localization/auto-translate-disabled-warning-dialog/auto-translate-disabled-warning-dialog.component';
import { AutoTranslateMenuDialogComponent } from '../../localization/auto-translate-menu-dialog/auto-translate-menu-dialog.component';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FieldsTranslateService } from '../../state/fields-translate.service';
import { ItemService } from '../../state/item.service';

@Component({
    selector: 'app-entity-translate-menu',
    templateUrl: './entity-translate-menu.component.html',
    styleUrls: ['./entity-translate-menu.component.scss'],
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

  constructor(
    private matDialog: MatDialog,
    private itemService: ItemService,
    private eavService: FormConfigService,
    private fieldTranslateSvc: FieldsTranslateService,
    private viewContainerRef: ViewContainerRef,
    private fieldSettingsSvc: FieldsSettingsService,
  ) {
    // debug...
    // effect(() => {
    //   console.log(`2dm ${this.entityGuid()} slotIsEmpty:` + this.slotIsEmpty());
    //   console.log(`2dm autoTranslatableFields:` + this.#autoTranslatableFields());
    // });
  }

  #autoTranslatableFields = computed(() => {
    // console.log(`2dm #AutoTrans:`, val, (this.fieldsTranslateService as any).entityGuid);
    return this.fieldTranslateSvc.findAutoTranslatableFields();
  });

  protected slotIsEmpty = computed(() => {
    return this.itemService.slotIsEmpty(this.entityGuid())();
  }, SignalEquals.bool);

  language = this.eavService.language;

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
        fieldName: autoTransFields[0],
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

}
