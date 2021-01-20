import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FieldSettings } from '../../../../../edit-types';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService } from '../../../../shared/services/eav.service';
import { CustomValidators } from '../../../validators/custom-validators';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { BaseComponent } from '../../base/base.component';
import { AdamControl } from './hyperlink-library.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'hyperlink-library',
  templateUrl: './hyperlink-library.component.html',
  styleUrls: ['./hyperlink-library.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ComponentMetadata({
  wrappers: [
    WrappersConstants.DropzoneWrapper,
    WrappersConstants.LocalizationWrapper,
    WrappersConstants.HyperlinkLibraryExpandableWrapper,
    WrappersConstants.AdamAttachWrapper,
  ],
})
export class HyperlinkLibraryComponent extends BaseComponent<null> implements OnInit, OnDestroy {
  /** Requires more handling that normal subscriptions */
  private adamValidation: Subscription;

  constructor(eavService: EavService, validationMessagesService: ValidationMessagesService) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.subscription.add(
      this.settings$.subscribe(settings => {
        this.attachAdam(settings);
        this.attachAdamValidator(settings.Required);
      })
    );
  }

  ngOnDestroy() {
    this.adamValidation?.unsubscribe();
    super.ngOnDestroy();
  }

  private attachAdam(settings: FieldSettings) {
    this.config.adam.setConfig({
      allowAssetsInRoot: settings.AllowAssetsInRoot,
      autoLoad: true,
      enableSelect: false,
      rootSubfolder: settings.Paths,
      fileFilter: settings.FileFilter,
      folderDepth: settings.FolderDepth || 0,
      metadataContentTypes: settings.MetadataContentTypes,
    });
  }

  private attachAdamValidator(required: boolean) {
    if (!required) {
      this.adamValidation?.unsubscribe();
      this.control.setValidators(this.config.field.validation);
      return;
    }

    const validators = [
      ...this.config.field.validation,
      CustomValidators.validateAdam(),
    ];
    this.control.setValidators(validators);
    this.adamValidation = this.config.adam.items$.subscribe(items => {
      (this.control as AdamControl).adamItems = items.length;
      // onlySelf doesn't update form being valid for some reason
      this.control.updateValueAndValidity(/*{ onlySelf: true }*/);
    });
  }
}
