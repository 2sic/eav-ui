import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { AdamConfig } from '../../../../shared/models/adam/adam-config';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { CustomValidators } from '../../../validators/custom-validators';
import { BaseComponent } from '../../base/base.component';
import { EavService } from '../../../../shared/services/eav.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { FieldSettings } from '../../../../../edit-types';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'hyperlink-library',
  templateUrl: './hyperlink-library.component.html',
  styleUrls: ['./hyperlink-library.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@InputType({
  wrapper: [WrappersConstants.DropzoneWrapper, WrappersConstants.EavLocalizationWrapper,
  WrappersConstants.HyperlinkLibraryExpandableWrapper, WrappersConstants.AdamAttachWrapper],
})
export class HyperlinkLibraryComponent extends BaseComponent<null> implements OnInit, OnDestroy {
  private subscription = new Subscription();
  /** Requires more handling that normal subscriptions */
  private adamSubscription: Subscription;

  constructor(eavService: EavService, validationMessagesService: ValidationMessagesService) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.subscription.add(this.settings$.subscribe(settings => {
      this.attachAdam(settings);
      this.attachAdamValidator(settings.Required);
    }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.adamSubscription.unsubscribe();
  }

  private attachAdam(settings: FieldSettings) {
    if (!this.config.adam) { return; }

    this.config.adam.updateCallback = (fileItem: any) => { };
    this.config.adam.afterUploadCallback = (fileItem: any) => { };
    this.config.adam.setConfig({
      ...new AdamConfig(),
      adamModeConfig: { usePortalRoot: false },
      allowAssetsInRoot: settings.AllowAssetsInRoot === false ? false : true,
      autoLoad: true,
      enableSelect: false,
      folderDepth: settings.FolderDepth || 0,
      metadataContentTypes: settings.MetadataContentTypes || '',
    });
  }

  private attachAdamValidator(required: boolean) {
    if (!required) {
      this.adamSubscription?.unsubscribe();
      this.control.setValidators(this.config.field.validation);
      return;
    }

    const validators = [
      ...this.config.field.validation,
      CustomValidators.validateAdam(this.config.adam.items$),
    ];
    this.control.setValidators(validators);
    // onlySelf doesn't update form being valid for some reason
    this.control.updateValueAndValidity(/*{ onlySelf: true }*/);
    this.adamSubscription = this.config.adam.items$.subscribe(items => {
      this.control.updateValueAndValidity(/*{ onlySelf: true }*/);
    });
  }
}
