import { Component, OnDestroy, OnInit } from '@angular/core';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseComponent } from '../../base/base.component';
import { AdamControl } from './hyperlink-library.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'hyperlink-library',
  templateUrl: './hyperlink-library.component.html',
  styleUrls: ['./hyperlink-library.component.scss'],
})
@FieldMetadata({
  wrappers: [
    WrappersConstants.DropzoneWrapper,
    WrappersConstants.LocalizationWrapper,
    WrappersConstants.HyperlinkLibraryExpandableWrapper,
    WrappersConstants.AdamWrapper,
  ],
})
export class HyperlinkLibraryComponent extends BaseComponent<null> implements OnInit, OnDestroy {

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.attachAdam();
    this.attachAdamValidator();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  private attachAdam() {
    this.subscription.add(
      this.settings$.pipe(
        map(settings => ({
          AllowAssetsInRoot: settings.AllowAssetsInRoot,
          Paths: settings.Paths,
          FileFilter: settings.FileFilter,
          FolderDepth: settings.FolderDepth,
          MetadataContentTypes: settings.MetadataContentTypes,
        })),
        distinctUntilChanged(GeneralHelpers.objectsEqual),
      ).subscribe(settings => {
        this.config.adam.setConfig({
          allowAssetsInRoot: settings.AllowAssetsInRoot,
          autoLoad: true,
          enableSelect: false,
          rootSubfolder: settings.Paths,
          fileFilter: settings.FileFilter,
          folderDepth: settings.FolderDepth || 0,
          metadataContentTypes: settings.MetadataContentTypes,
        });
      })
    );
  }

  private attachAdamValidator() {
    let first = true;
    this.subscription.add(
      this.config.adam.items$.pipe(
        map(items => items.length),
        distinctUntilChanged(),
      ).subscribe(itemsCount => {
        (this.control as AdamControl).adamItems = itemsCount;
        if (!first) {
          this.control.updateValueAndValidity();
        }
        first = false;
      })
    );
  }
}
