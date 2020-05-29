import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';
import { FieldMaskService } from '../../../../../shared/field-mask.service';
import { AppAssetsService } from '../../../../shared/services/app-assets.service';
import { templateTypes } from './string-template-picker.constants';
import { BaseComponent } from '../../base/base.component';
import { EavService } from '../../../../shared/services/eav.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-template-picker',
  templateUrl: './string-template-picker.component.html',
  styleUrls: ['./string-template-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@InputType({
  wrapper: [WrappersConstants.eavLocalizationWrapper],
})
export class StringTemplatePickerComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  templateOptions$$ = new BehaviorSubject<string[]>([]);

  private typeWatcher: FieldMaskService;
  private locationWatcher: FieldMaskService;
  private activeSpec = templateTypes.Token;
  private templates: string[] = [];
  private global = false;

  constructor(eavService: EavService, private appAssetsService: AppAssetsService) {
    super(eavService);
  }

  ngOnInit() {
    super.ngOnInit();
    // set change-watchers to the other values
    this.typeWatcher = new FieldMaskService('[Type]', this.group.controls, this.setFileConfig.bind(this), null);
    this.locationWatcher = new FieldMaskService('[Location]', this.group.controls, this.onLocationChange.bind(this), null);

    this.setFileConfig(this.typeWatcher.resolve() || 'Token'); // use token setting as default, till the UI tells us otherwise
    this.onLocationChange(this.locationWatcher.resolve() || null); // set initial file list
  }

  private setFileConfig(type: string) {
    this.activeSpec = templateTypes[type];
    this.setTemplateOptions();
  }

  private onLocationChange(location: string) {
    this.global = (location === 'Host File System');

    this.appAssetsService.getAll(this.global).subscribe(templates => {
      this.templates = templates;
      this.setTemplateOptions();
    });
  }

  private setTemplateOptions() {
    let filtered = this.templates;
    const ext = this.activeSpec.ext;
    // new feature in v11 - '.code.xxx' files shouldn't be shown, they are code-behind
    filtered = filtered.filter(template => !template.includes('.code.'));
    filtered = filtered.filter(template => template.slice(template.length - ext.length) === ext);
    this.templateOptions$$.next(filtered);
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
    this.appAssetsService.create(fullPath, this.activeSpec.body, this.global).subscribe(res => {
      if (res === false) {
        alert('Server reported that create failed - the file probably already exists'); // todo: i18n
      } else {
        this.templates.push(fullPath);
        this.setTemplateOptions();
        this.control.patchValue(fullPath);
      }
    });
  }

  ngOnDestroy() {
    this.templateOptions$$.complete();
    this.typeWatcher.destroy();
    this.locationWatcher.destroy();
  }
}
