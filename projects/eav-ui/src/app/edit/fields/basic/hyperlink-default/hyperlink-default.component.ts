import { ChangeDetectorRef, Component, computed, OnDestroy, OnInit, signal, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HyperlinkDefaultBaseComponent } from './hyperlink-default-base.component';
import { HyperlinkDefaultLogic } from './hyperlink-default-logic';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { ControlHelpers } from '../../../shared/helpers/control.helpers';
import { FormConfigService, AdamService, EditRoutingService, FormsStateService } from '../../../shared/services';
import { LinkCacheService } from '../../../shared/store/ngrx-data';
import { FieldMetadata } from '../../field-metadata.decorator';
import { WrappersConstants } from '../../wrappers/wrappers.constants';
import { PasteClipboardImageDirective } from '../../directives/paste-clipboard-image.directive';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { SignalHelpers } from '../../../../shared/helpers/signal.helpers';
import { mapUntilObjChanged } from '../../../../shared/rxJs/mapUntilChanged';
import { AdamItem } from '../../../../../../../edit-types/src/AdamItem';

@Component({
  selector: InputTypeConstants.HyperlinkDefault,
  templateUrl: './hyperlink-default.component.html',
  styleUrls: ['./hyperlink-default.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
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
    TippyDirective,
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
  protected buttonAdam = computed(() => this.settings().Buttons.includes('adam'), SignalHelpers.boolEquals);
  protected buttonPage = computed(() => this.settings().Buttons.includes('page'), SignalHelpers.boolEquals);
  protected buttonMore = computed(() => this.settings().Buttons.includes('more'), SignalHelpers.boolEquals);
  protected showAdam = computed(() => this.settings().ShowAdam, SignalHelpers.boolEquals);
  protected showPagePicker = computed(() => this.settings().ShowPagePicker, SignalHelpers.boolEquals);
  protected showImageManager = computed(() => this.settings().ShowImageManager, SignalHelpers.boolEquals);
  protected showFileManager = computed(() => this.settings().ShowFileManager, SignalHelpers.boolEquals);
  protected enableImageConfiguration = computed(() => this.settings().EnableImageConfiguration, SignalHelpers.boolEquals);

  open = this.editRoutingService.isExpandedSignal(this.config.index, this.config.entityGuid);

  adamConfig = signal([]);

  adamItem = computed(() => {
    const controlStatus = this.controlStatus();
    const adamItems = this.adamConfig() as AdamItem[];

    if (!controlStatus.value || !adamItems.length) return;

    const match = controlStatus.value.trim().match(/^file:([0-9]+)$/i);
    if (!match) return;

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
  }

  toggleAdam(usePortalRoot: boolean, showImagesOnly: boolean) {
    this.config.adam.toggle(usePortalRoot, showImagesOnly);
  }

  private attachAdam() {
    this.subscriptions.add(
      this.fieldState.settings$.pipe(
        mapUntilObjChanged(settings => ({
          Paths: settings.Paths,
          FileFilter: settings.FileFilter,
        })),
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
    const usePath = this.settings().ServerResourceMapping === 'url';
    const newValue = !usePath ? item.ReferenceId : item.Url;
    ControlHelpers.patchControlValue(this.control, newValue);
  }
}
