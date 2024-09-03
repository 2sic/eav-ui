import { Component, computed, effect, inject, Injector, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { HyperlinkLibraryLogic } from './hyperlink-library-logic';
import { AdamControl } from './hyperlink-library.models';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldState } from '../../field-state';
import { FieldMetadata } from '../../field-metadata.decorator';
import { WrappersCatalog } from '../../wrappers/wrappers.constants';
import { AdamConfig } from '../../../../../../../edit-types/src/AdamConfig';
import { SignalEquals } from '../../../../shared/signals/signal-equals';
import { mapUntilChanged } from '../../../../shared/rxJs/mapUntilChanged';

@Component({
  selector: InputTypeCatalog.HyperlinkLibrary,
  template: '', // note: no template - it will just show the adam component in the popup
  styleUrls: [],
  standalone: true,
})
@FieldMetadata({
  wrappers: [
    WrappersCatalog.DropzoneWrapper,
    WrappersCatalog.LocalizationWrapper,
    WrappersCatalog.HyperlinkLibraryExpandableWrapper,
    WrappersCatalog.AdamWrapper,
  ],
})
export class HyperlinkLibraryComponent implements OnInit {

  protected fieldState = inject(FieldState);

  private injector = inject(Injector);

  constructor() {
    HyperlinkLibraryLogic.importMe();

    let first = true;
    effect(() => {
      // Patch length info to the control state, so the validator can pick it up
      (this.fieldState.control as AdamControl).adamItems = this.fieldState.config.adam.items().length;
      // Update the validity of the control - but not during initialization, only on later changes
      // otherwise the field would glow red right from the start
      if (!first)
        this.fieldState.control.updateValueAndValidity();
      first = false;
    });
  }

  ngOnInit() {
    this.attachAdamConfig();
    // this.attachAdamValidator();
  }

  private attachAdamConfig() {
    const adamConfig = computed(() => {
      const settings = this.fieldState.settings();
      return {
        allowAssetsInRoot: settings.AllowAssetsInRoot,
        autoLoad: true,
        enableSelect: false,
        rootSubfolder: settings.Paths,
        fileFilter: settings.FileFilter,
        folderDepth: settings.FolderDepth || 0,
        metadataContentTypes: settings.MetadataContentTypes,
      } as AdamConfig;
    }, SignalEquals.object);

    effect(() => {
      const config = adamConfig();
      // console.warn('adamConfig in HyperlinkLibrary', config);
      this.fieldState.config.adam.setConfig(config);
    }, { injector: this.injector, allowSignalWrites: true });
  }
}
