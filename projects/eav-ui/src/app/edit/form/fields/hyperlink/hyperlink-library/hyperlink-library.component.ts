import { Component, inject, OnInit } from '@angular/core';
import { distinctUntilChanged, map } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { HyperlinkLibraryLogic } from './hyperlink-library-logic';
import { AdamControl } from './hyperlink-library.models';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';
import { FieldState } from '../../../builder/fields-builder/field-state';

@Component({
    selector: InputTypeConstants.HyperlinkLibrary,
    templateUrl: './hyperlink-library.component.html',
    styleUrls: ['./hyperlink-library.component.scss'],
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
export class HyperlinkLibraryComponent /*extends BaseFieldComponent<null>*/ implements OnInit {

  protected fieldState = inject(FieldState);

  constructor() {
    // super();
    HyperlinkLibraryLogic.importMe();
  }

  ngOnInit() {
    // super.ngOnInit();
    this.attachAdam();
    this.attachAdamValidator();
  }

  private attachAdam() {
    // this.subscriptions.add(
      this.fieldState.settings$.pipe(
        map(settings => ({
          AllowAssetsInRoot: settings.AllowAssetsInRoot,
          Paths: settings.Paths,
          FileFilter: settings.FileFilter,
          FolderDepth: settings.FolderDepth,
          MetadataContentTypes: settings.MetadataContentTypes,
        })),
        distinctUntilChanged(RxHelpers.objectsEqual),
      ).subscribe(settings => {
        this.fieldState.config.adam.setConfig({
          allowAssetsInRoot: settings.AllowAssetsInRoot,
          autoLoad: true,
          enableSelect: false,
          rootSubfolder: settings.Paths,
          fileFilter: settings.FileFilter,
          folderDepth: settings.FolderDepth || 0,
          metadataContentTypes: settings.MetadataContentTypes,
        });
      })
    // );
  }

  private attachAdamValidator() {
    let first = true;
    // this.subscriptions.add(
      this.fieldState.config.adam.items$.pipe(
        map(items => items.length),
        distinctUntilChanged(),
      ).subscribe(itemsCount => {
        (this.fieldState.control as AdamControl).adamItems = itemsCount;
        if (!first) {
          this.fieldState.control.updateValueAndValidity();
        }
        first = false;
      })
    // );
  }
}
