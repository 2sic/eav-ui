import { Component, computed, effect, inject, Injector, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { HyperlinkLibraryLogic } from './hyperlink-library-logic';
import { AdamControl } from './hyperlink-library.models';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldState } from '../../field-state';
import { FieldMetadata } from '../../field-metadata.decorator';
import { WrappersCatalog } from '../../wrappers/wrappers.constants';
import { AdamConfig } from '../../../../../../../edit-types/src/AdamConfig';
import { SignalHelpers } from '../../../../shared/helpers/signal.helpers';
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
  }

  ngOnInit() {
    this.attachAdamConfig();
    this.attachAdamValidator();
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
    }, SignalHelpers.objectEquals);

    effect(() => {
      const config = adamConfig();
      this.fieldState.config.adam.setConfig(config);
    }, { injector: this.injector, allowSignalWrites: true });
  }

  private attachAdamValidator() {
    let first = true;
    // this.subscriptions.add(
    this.fieldState.config.adam.items$.pipe(
      map(items => items.length),
      mapUntilChanged(m => m),
    ).subscribe(itemsCount => {
      (this.fieldState.control as AdamControl).adamItems = itemsCount;
      if (!first)
        this.fieldState.control.updateValueAndValidity();
      first = false;
    })
    // );
  }
}
