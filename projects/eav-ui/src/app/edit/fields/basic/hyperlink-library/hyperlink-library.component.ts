import { Component, effect, inject, Injector, OnInit } from '@angular/core';
import { HyperlinkLibraryLogic } from './hyperlink-library-logic';
import { AdamControl } from './hyperlink-library.models';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldState } from '../../field-state';
import { FieldMetadata } from '../../field-metadata.decorator';
import { WrappersCatalog } from '../../wrappers/wrappers.constants';
import { AdamConfig } from '../../../../../../../edit-types/src/AdamConfig';
import { computedObj } from '../../../../shared/signals/signal.utilities';

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
    const adamConfig = computedObj('adamConfig', () => {
      const s = this.fieldState.settings();
      return {
        allowAssetsInRoot: s.AllowAssetsInRoot,
        autoLoad: true,
        enableSelect: false,
        rootSubfolder: s.Paths,
        fileFilter: s.FileFilter,
        folderDepth: s.FolderDepth || 0,
        metadataContentTypes: s.MetadataContentTypes,
      } as AdamConfig;
    });

    effect(() => {
      const config = adamConfig();
      // console.warn('adamConfig in HyperlinkLibrary', config);
      this.fieldState.config.adam.setConfig(config);
    }, { injector: this.injector, allowSignalWrites: true });
  }
}
