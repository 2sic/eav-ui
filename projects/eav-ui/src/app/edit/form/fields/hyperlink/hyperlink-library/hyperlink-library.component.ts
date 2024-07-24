import { Component, computed, effect, inject, Injector, OnInit } from '@angular/core';
import { distinctUntilChanged, map } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { HyperlinkLibraryLogic } from './hyperlink-library-logic';
import { AdamControl } from './hyperlink-library.models';
import { FieldState } from '../../../builder/fields-builder/field-state';
import { AdamConfig } from 'projects/edit-types';
import { SignalHelpers } from 'projects/eav-ui/src/app/shared/helpers/signal.helpers';

@Component({
  selector: InputTypeConstants.HyperlinkLibrary,
  template: '', // note: no template - it will just show the adam component in the popup
  styleUrls: [],
  standalone: true,
})
@FieldMetadata({
  wrappers: [
    WrappersConstants.DropzoneWrapper,
    WrappersConstants.LocalizationWrapper,
    WrappersConstants.HyperlinkLibraryExpandableWrapper,
    WrappersConstants.AdamWrapper,
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
      distinctUntilChanged(),
    ).subscribe(itemsCount => {
      (this.fieldState.control as AdamControl).adamItems = itemsCount;
      if (!first)
        this.fieldState.control.updateValueAndValidity();
      first = false;
    })
    // );
  }
}
