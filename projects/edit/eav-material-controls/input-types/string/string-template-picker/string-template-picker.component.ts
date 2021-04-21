import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { FieldMask } from '../../../../shared/helpers';
import { AssetsService, EavService, FieldsSettingsService } from '../../../../shared/services';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { BaseComponent } from '../../base/base.component';
import { templateTypes } from './string-template-picker.constants';
import { StringTemplatePickerTemplateVars } from './string-template-picker.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-template-picker',
  templateUrl: './string-template-picker.component.html',
  styleUrls: ['./string-template-picker.component.scss'],
})
@ComponentMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class StringTemplatePickerComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  templateVars$: Observable<StringTemplatePickerTemplateVars>;

  private templateOptions$: BehaviorSubject<string[]>;
  private typeMask: FieldMask;
  private locationMask: FieldMask;
  private activeSpec = templateTypes.Token;
  private templates: string[] = [];
  private global = false;
  /** Reset only after templates have been fetched once */
  private resetIfNotFound = false;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
    private assetsService: AssetsService,
  ) {
    super(eavService, validationMessagesService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.templateOptions$ = new BehaviorSubject<string[]>([]);
    // set change-watchers to the other values
    this.typeMask = new FieldMask('[Type]', this.group.controls, this.setFileConfig.bind(this), null);
    this.locationMask = new FieldMask('[Location]', this.group.controls, this.onLocationChange.bind(this), null);

    this.setFileConfig(this.typeMask.resolve() || 'Token'); // use token setting as default, till the UI tells us otherwise
    this.onLocationChange(this.locationMask.resolve() || null); // set initial file list

    this.templateVars$ = combineLatest([this.label$, this.required$, this.templateOptions$, this.disabled$, this.touched$]).pipe(
      map(([label, required, templateOptions, disabled, touched]) => {
        const templateVars: StringTemplatePickerTemplateVars = {
          label,
          required,
          templateOptions,
          disabled,
          touched,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy() {
    this.templateOptions$.complete();
    this.typeMask.destroy();
    this.locationMask.destroy();
    super.ngOnDestroy();
  }

  private setFileConfig(type: string) {
    this.activeSpec = templateTypes[type];
    this.setTemplateOptions();
  }

  private onLocationChange(location: string) {
    this.global = (location === 'Host File System');

    this.assetsService.getAll(this.global).subscribe(templates => {
      this.templates = templates;
      this.resetIfNotFound = true;
      this.setTemplateOptions();
    });
  }

  private setTemplateOptions() {
    let filtered = this.templates;
    const ext = this.activeSpec.ext;
    // new feature in v11 - '.code.xxx' files shouldn't be shown, they are code-behind
    filtered = filtered.filter(template => !template.includes('.code.'));
    filtered = filtered.filter(template => template.slice(template.length - ext.length) === ext);
    this.templateOptions$.next(filtered);
    const resetValue = this.resetIfNotFound && !filtered.find(template => template === this.control.value);
    if (resetValue) { this.control.patchValue(''); }
  }

  createTemplate() {
    let name = prompt('Enter new file name', this.activeSpec.suggestion); // todo: i18n
    if (!name) { return; }

    // 1. check for folders
    let path = '';
    name = name.replace('\\', '/');
    const foundSlash = name.lastIndexOf('/');
    if (foundSlash > -1) {
      path = name.substring(0, foundSlash + 1); // path with slash
      name = name.substring(foundSlash + 1);
    }

    // 2. check if extension already provided, otherwise or if not perfect, just attach default
    if (!name.endsWith(this.activeSpec.ext)) {
      name += this.activeSpec.ext;
    }

    // 3. check if cshtmls have a "_" in the file name (not folder, must be the file name part)
    if (this.activeSpec.prefix !== '' && name[0] !== this.activeSpec.prefix) {
      name = this.activeSpec.prefix + name;
    }

    const fullPath = path + name;

    // 4. tell service to create it
    this.assetsService.create(fullPath, this.global).subscribe(res => {
      if (res === false) {
        alert('Server reported that create failed - the file probably already exists'); // todo: i18n
      } else {
        this.templates.push(fullPath);
        this.setTemplateOptions();
        this.control.patchValue(fullPath);
      }
    });
  }

}
