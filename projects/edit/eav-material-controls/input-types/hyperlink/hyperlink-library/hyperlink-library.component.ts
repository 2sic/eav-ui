import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, ValidatorFn } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { AdamConfig, AdamModeConfig } from '../../../../shared/models/adam/adam-config';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';
import { CustomValidators } from '../../../validators/custom-validators';
import { angularConsoleLog } from '../../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'hyperlink-library',
  templateUrl: './hyperlink-library.component.html',
  styleUrls: ['./hyperlink-library.component.scss']
})
@InputType({
  wrapper: [WrappersConstants.DropzoneWrapper, WrappersConstants.EavLocalizationWrapper,
  WrappersConstants.HyperlinkLibraryExpandableWrapper, WrappersConstants.AdamAttachWrapper],
})
export class HyperlinkLibraryComponent implements Field, OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  adamModeConfig: AdamModeConfig = {
    usePortalRoot: false
  };

  get folderDepth() {
    return this.config.field.settings.FolderDepth || '';
  }

  get metadataContentTypes() {
    return this.config.field.settings.MetadataContentTypes || '';
  }

  get allowAssetsInRoot() {
    return this.config.field.settings.AllowAssetsInRoot === false ? false : true;
  }

  private subscriptions: Subscription[] = [];

  constructor() { }

  ngOnInit() {
    this.attachAdam();
    this.attachAdamValidator();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    this.subscriptions = null;
  }

  private attachAdam() {
    if (this.config.adam) {
      // callbacks - functions called from adam
      this.config.adam.updateCallback = (fileItem: any) => { };

      // binding for dropzone
      this.config.adam.afterUploadCallback = (fileItem: any) => { };

      angularConsoleLog('HyperLibrary setConfig : ', Object.assign(new AdamConfig(), {
        adamModeConfig: this.adamModeConfig,
        allowAssetsInRoot: this.allowAssetsInRoot,
        autoLoad: true,
        enableSelect: false,
        folderDepth: this.folderDepth,
        metadataContentTypes: this.metadataContentTypes
      }));
      // set adam configuration (initial config)
      this.config.adam.setConfig(Object.assign(new AdamConfig(), {
        adamModeConfig: this.adamModeConfig,
        allowAssetsInRoot: this.allowAssetsInRoot,
        autoLoad: true,
        enableSelect: false,
        folderDepth: this.folderDepth,
        metadataContentTypes: this.metadataContentTypes
      }));
    }
  }

  private attachAdamValidator() {
    if (this.config.field.required) {
      const validators: ValidatorFn[] = [];
      validators.push(
        ...this.config.field.validation,
        CustomValidators.validateAdam(this.config.adam.items$),
      );
      this.group.controls[this.config.field.name].setValidators(validators);
      // onlySelf doesn't update form being valid for some reason
      this.group.controls[this.config.field.name].updateValueAndValidity(/*{ onlySelf: true }*/);
      this.subscriptions.push(
        this.config.adam.items$.subscribe(items => {
          this.group.controls[this.config.field.name].updateValueAndValidity(/*{ onlySelf: true }*/);
        }),
      );
    }
  }
}
