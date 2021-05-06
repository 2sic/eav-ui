import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import { combineLatest, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
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

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
  ) {
    super(eavService, validationMessagesService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.attachAdam();
    this.attachAdamValidator();
  }

  ngOnDestroy() {
    this.adamValidation?.unsubscribe();
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
    const validators$ = this.fieldsSettingsService.getFieldValidation$(this.config.fieldName);
    this.subscription.add(
      combineLatest([this.required$, validators$]).subscribe(([required, validators]) => {
        if (!required) {
          this.adamValidation?.unsubscribe();
          this.control.setValidators(validators);
          this.control.updateValueAndValidity();
          return;
        }

        const newValidators: ValidatorFn[] = [
          ...validators,
          CustomValidators.validateAdam(),
        ];
        this.control.setValidators(newValidators);
        this.control.updateValueAndValidity();

        this.adamValidation = this.config.adam.items$.subscribe(items => {
          (this.control as AdamControl).adamItems = items.length;
          this.control.updateValueAndValidity();
        });
      })
    );
  }
}
