import { ChangeDetectorRef, Component, computed, inject, OnDestroy, OnInit, signal, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { AdamItem } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { AdamService, FormConfigService, EditRoutingService, FormsStateService } from '../../../../shared/services';
import { LinkCacheService } from '../../../../shared/store/ngrx-data';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { HyperlinkDefaultBaseComponent } from './hyperlink-default-base.component';
import { HyperlinkDefaultLogic } from './hyperlink-default-logic';
import { HyperlinkDefaultViewModel } from './hyperlink-default.models';
import { TranslateModule } from '@ngx-translate/core';
import { PasteClipboardImageDirective } from '../../../../shared/directives/paste-clipboard-image.directive';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { ControlHelpers } from '../../../../shared/helpers/control.helpers';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';
import { FieldState } from '../../../builder/fields-builder/field-state';
import { SignalHelpers } from 'projects/eav-ui/src/app/shared/helpers/signal.helpers';

@Component({
  selector: InputTypeConstants.HyperlinkDefault,
  templateUrl: './hyperlink-default.component.html',
  styleUrls: ['./hyperlink-default.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    SharedComponentsModule,
    MatIconModule,
    NgClass,
    ExtendedModule,
    MatMenuModule,
    MatCardModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    PasteClipboardImageDirective,
    AsyncPipe,
    TranslateModule,
  ],
})
@FieldMetadata({
  wrappers: [
    WrappersConstants.DropzoneWrapper,
    WrappersConstants.LocalizationWrapper,
    WrappersConstants.HyperlinkDefaultExpandableWrapper,
    WrappersConstants.AdamWrapper,
  ],
})
export class HyperlinkDefaultComponent extends HyperlinkDefaultBaseComponent implements OnInit, OnDestroy {
  viewModel: Observable<HyperlinkDefaultViewModel>;

  protected fieldState = inject(FieldState);

  protected settingsTemp = this.fieldState.settings;
  protected configTemp = this.fieldState.config;
  protected controlStatusTemp = this.fieldState.controlStatus;


  protected buttonAdam = computed(() => this.settingsTemp().Buttons.includes('adam'), SignalHelpers.boolEquals);
  protected buttonPage = computed(() => this.settingsTemp().Buttons.includes('page'), SignalHelpers.boolEquals);
  protected buttonMore = computed(() => this.settingsTemp().Buttons.includes('more'), SignalHelpers.boolEquals);
  protected showAdam = computed(() => this.settingsTemp().ShowAdam, SignalHelpers.boolEquals);
  protected showPagePicker = computed(() => this.settingsTemp().ShowPagePicker, SignalHelpers.boolEquals);
  protected showImageManager = computed(() => this.settingsTemp().ShowImageManager, SignalHelpers.boolEquals);
  protected showFileManager = computed(() => this.settingsTemp().ShowFileManager, SignalHelpers.boolEquals);
  protected enableImageConfiguration = computed(() => this.settingsTemp().EnableImageConfiguration, SignalHelpers.boolEquals);

  open = this.editRoutingService.isExpandedSignal(this.configTemp.index, this.configTemp.entityGuid);

  adamConfig = signal([]);

  adamItem = computed(() => {
    const controlStatus = this.controlStatus();
    const adamItems = this.adamConfig() as AdamItem[];

    if (!controlStatus.value || !adamItems.length) { return; }

    const match = controlStatus.value.trim().match(/^file:([0-9]+)$/i);
    if (!match) { return; }

    const adamItemId = parseInt(match[1], 10);
    const adamItem = adamItems.find(i => i.Id === adamItemId);
    return adamItem;
  });

  constructor(
    eavService: FormConfigService,
    adamService: AdamService,
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    changeDetectorRef: ChangeDetectorRef,
    linkCacheService: LinkCacheService,
    editRoutingService: EditRoutingService,
    formsStateService: FormsStateService,
  ) {
    super(
      eavService,
      adamService,
      dialog,
      viewContainerRef,
      changeDetectorRef,
      linkCacheService,
      editRoutingService,
      formsStateService,
    );
    HyperlinkDefaultLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.attachAdam();

    this.config.adam.items$.subscribe(items => {
      this.adamConfig.set(items);
    });

    this.viewModel = combineLatest([
      combineLatest([this.preview$]),
    ]).pipe(
      map(([
        [preview],
      ]) => {
        const viewModel: HyperlinkDefaultViewModel = {
          preview,
        };
        return viewModel;
      }),
    );
  }

  toggleAdam(usePortalRoot: boolean, showImagesOnly: boolean) {
    this.config.adam.toggle(usePortalRoot, showImagesOnly);
  }

  private attachAdam() {
    this.subscriptions.add(
      this.settings$.pipe(
        map(settings => ({
          Paths: settings.Paths,
          FileFilter: settings.FileFilter,
        })),
        distinctUntilChanged(RxHelpers.objectsEqual),
      ).subscribe(settings => {
        this.config.adam.onItemClick = (item: AdamItem) => { this.setValue(item); };
        this.config.adam.onItemUpload = (item: AdamItem) => { this.setValue(item); };
        this.config.adam.setConfig({
          rootSubfolder: settings.Paths,
          fileFilter: settings.FileFilter,
          autoLoad: true,
        });
      })
    );
  }

  private setValue(item: AdamItem) {
    const usePath = this.settings$.value.ServerResourceMapping === 'url';
    const newValue = !usePath ? item.ReferenceId : item.Url;
    ControlHelpers.patchControlValue(this.control, newValue);
  }
}
