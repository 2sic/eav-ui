import { ChangeDetectorRef, Component, computed, effect, OnInit, ViewContainerRef } from '@angular/core';
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
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldMetadata } from '../../field-metadata.decorator';
import { WrappersCatalog } from '../../wrappers/wrappers.constants';
import { PasteClipboardImageDirective } from '../../directives/paste-clipboard-image.directive';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { SignalEquals } from '../../../../shared/signals/signal-equals';
import { AdamItem } from '../../../../../../../edit-types/src/AdamItem';
import { FormConfigService } from '../../../form/form-config.service';
import { FormsStateService } from '../../../form/forms-state.service';
import { EditRoutingService } from '../../../routing/edit-routing.service';
import { LinkCacheService } from '../../../shared/adam/link-cache.service';
import isEqual from 'lodash-es/isEqual';

@Component({
  selector: InputTypeCatalog.HyperlinkDefault,
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
    TranslateModule,
    TippyDirective,
  ],
})
@FieldMetadata({
  wrappers: [
    WrappersCatalog.DropzoneWrapper,
    WrappersCatalog.LocalizationWrapper,
    WrappersCatalog.HyperlinkDefaultExpandableWrapper,
    WrappersCatalog.AdamWrapper,
  ],
})
export class HyperlinkDefaultComponent extends HyperlinkDefaultBaseComponent implements OnInit {
  protected buttonAdam = computed(() => this.settings().Buttons.includes('adam'), SignalEquals.bool);
  protected buttonPage = computed(() => this.settings().Buttons.includes('page'), SignalEquals.bool);
  protected buttonMore = computed(() => this.settings().Buttons.includes('more'), SignalEquals.bool);
  protected showAdam = computed(() => this.settings().ShowAdam, SignalEquals.bool);
  protected showPagePicker = computed(() => this.settings().ShowPagePicker, SignalEquals.bool);
  protected showImageManager = computed(() => this.settings().ShowImageManager, SignalEquals.bool);
  protected showFileManager = computed(() => this.settings().ShowFileManager, SignalEquals.bool);
  protected enableImageConfiguration = computed(() => this.settings().EnableImageConfiguration, SignalEquals.bool);

  open = this.editRoutingService.isExpandedSignal(this.config.index, this.config.entityGuid);

  constructor(
    eavService: FormConfigService,
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    changeDetectorRef: ChangeDetectorRef,
    linkCacheService: LinkCacheService,
    editRoutingService: EditRoutingService,
    formsStateService: FormsStateService,
  ) {
    super(
      eavService,
      dialog,
      viewContainerRef,
      changeDetectorRef,
      linkCacheService,
      editRoutingService,
      formsStateService,
    );
    HyperlinkDefaultLogic.importMe();

    // ADAM Settings, in a way which ensures they only fire on relevant changes
    // must be in constructor for effect() to work
    const adamSettings = computed(() => {
      const s = this.fieldState.settings();
      return {
        rootSubfolder: s.Paths,
        fileFilter: s.FileFilter,
        autoLoad: true,
      };
    }, { equal: isEqual});

    effect(() => {
      const config = adamSettings();
      // console.warn('adamConfig in Hyperlink-Default', config);
      this.config.adam.setConfig(config);
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    super.ngOnInit();

    // Should probably be in ngOnInit, because this.config.adam is created late
    this.config.adam.onItemClick = (item: AdamItem) => { this.setValue(item); };
    this.config.adam.onItemUpload = (item: AdamItem) => { this.setValue(item); };

  }

  toggleAdam(usePortalRoot: boolean, showImagesOnly: boolean) {
    this.config.adam.toggle(usePortalRoot, showImagesOnly);
  }

  private setValue(item: AdamItem) {
    const usePath = this.settings().ServerResourceMapping === 'url';
    const newValue = !usePath ? item.ReferenceId : item.Url;
    this.fieldState.ui().setIfChanged(newValue);
  }
}
