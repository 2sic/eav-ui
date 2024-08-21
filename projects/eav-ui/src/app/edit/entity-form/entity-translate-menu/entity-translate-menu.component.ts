import { Component, computed, inject, Input, OnDestroy, OnInit, Signal, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, map, Observable, Subscription } from 'rxjs';
import { TranslationState } from '../../state/fields-configs.model';
import { ItemService } from '../../shared/store/ngrx-data';
import { AutoTranslateDisabledWarningDialog } from '../../localization/auto-translate-disabled-warning-dialog/auto-translate-disabled-warning-dialog.component';
import { AutoTranslateMenuDialogComponent } from '../../localization/auto-translate-menu-dialog/auto-translate-menu-dialog.component';
import { TranslateMenuDialogConfig, TranslateMenuDialogData } from '../../fields/wrappers/localization/translate-menu-dialog/translate-menu-dialog.models';
import { EntityTranslateMenuViewModel } from './entity-translate-menu.models';
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
import { ItemIdentifierHeader } from '../../../shared/models/edit-form.model';

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
export class EntityTranslateMenuComponent implements OnInit, OnDestroy {
  @Input() entityGuid: string;

  viewModel$: Observable<EntityTranslateMenuViewModel>;
  autoTranslatableFields: string[];
  translationState: TranslationState;
  private subscription: Subscription;

  private formsStateService = inject(FormsStateService);
  protected readOnly = this.formsStateService.readOnly;

  protected slotIsEmpty!: Signal<boolean>;

  constructor(
    private dialog: MatDialog,
    private itemService: ItemService,
    private eavService: FormConfigService,
    private fieldsTranslateService: FieldsTranslateService,
    private viewContainerRef: ViewContainerRef,
    private fieldsSettingsService: FieldsSettingsService,
  ) { }

  ngOnInit() {
    this.slotIsEmpty = this.itemService.slotIsEmpty(this.entityGuid);

    this.viewModel$ = combineLatest([this.eavService.language$]).pipe(
      map(([lang]) => {
        const viewModel: EntityTranslateMenuViewModel = {
          ...lang,
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
      const config: TranslateMenuDialogConfig = {
        entityGuid: this.entityGuid,
        fieldName: this.autoTranslatableFields[0],
        // name: '',
        // focused$: undefined
      }
      const dialogData: TranslateMenuDialogData = {
        config,
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
