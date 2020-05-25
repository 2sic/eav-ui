import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { take } from 'rxjs/operators';

import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';
import { FieldMaskService } from '../../../../../shared/field-mask.service';
import { AppAssetsService, AssetsSvc } from '../../../../shared/services/app-assets.service';
import { EavConfiguration } from '../../../../shared/models/eav-configuration';
import { EavService } from '../../../../shared/services/eav.service';
import { StringTemplatePickerFile } from '../../../../shared/models/input-types/string-template-picker-file';
import { angularConsoleLog } from '../../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { defaultTokenName, defaultTemplateName } from '../../../../../ng-dialogs/src/app/shared/constants/file-names.constants';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-template-picker',
  templateUrl: './string-template-picker.component.html',
  styleUrls: ['./string-template-picker.component.scss']
})
@InputType({
  wrapper: [WrappersConstants.eavLocalizationWrapper],
})
export class StringTemplatePickerComponent implements OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  private typeWatcher: FieldMaskService;
  private locWatcher: FieldMaskService;
  file: StringTemplatePickerFile;
  templates: string[];
  private eavConfig: EavConfiguration;
  private svcApp: AssetsSvc;
  private svcGlobal: AssetsSvc;
  private svcCurrent: AssetsSvc;

  constructor(
    private appAssetsSvc: AppAssetsService,
    private eavService: EavService,
  ) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    this.activate();
  }

  private activate() {
    // ensure settings are merged
    if (!this.config.field.settings.merged) {
      this.config.field.settings.merged = {};
    }

    // set change-watchers to the other values
    this.typeWatcher = new FieldMaskService('[Type]', this.group.controls, this.setFileConfig.bind(this), null);
    this.locWatcher = new FieldMaskService('[Location]', this.group.controls, this.onLocationChange.bind(this), null);

    // create initial list for binding
    this.templates = [];

    this.svcApp = this.appAssetsSvc.createSvc(this.eavConfig.appId, false);
    this.svcGlobal = this.appAssetsSvc.createSvc(this.eavConfig.appId, true);

    this.setFileConfig(this.typeWatcher.resolve() || 'Token'); // use token setting as default, till the UI tells us otherwise
    this.onLocationChange(this.locWatcher.resolve() || null); // set initial file list
  }

  private setFileConfig(type: string) {
    const specs: { [key: string]: StringTemplatePickerFile } = {
      // tslint:disable-next-line:max-line-length
      Token: { ext: '.html', prefix: '', suggestion: defaultTokenName, body: '<p>You successfully created your own template. Start editing it by hovering the "Manage" button and opening the "Edit Template" dialog.</p>' },
      // tslint:disable-next-line:max-line-length
      'C# Razor': { ext: '.cshtml', prefix: '_', suggestion: defaultTemplateName, body: '<p>You successfully created your own template. Start editing it by hovering the "Manage" button and opening the "Edit Template" dialog.</p>' }
    };
    this.file = specs[type];
  }

  /** when the watcher says the location changed, reset stuff */
  private onLocationChange(loc: string) {
    this.svcCurrent = (loc === 'Host File System')
      ? this.svcGlobal
      : this.svcApp;

    this.svcCurrent.getAll().pipe(take(1)).subscribe(templates => {
      // new feature in v11 - '.code.xxx' files shouldn't be shown, they are code-behind
      this.templates = templates.filter(template => template.indexOf('.code.') === -1);
    });
  }

  /** filter to only show files which are applicable to this */
  isValidFile(paths: string[], ext: string) {
    // set the required parameter name to **number**
    const out: string[] = [];
    paths.forEach(path => {
      if (path.slice(path.length - ext.length) === ext) {
        out.push(path);
      }
    });
    return out;
  }

  // ask for a new file name and add
  add() {
    let fileName = prompt('enter new file name', this.file.suggestion); // todo: i18n

    if (!fileName) { return; }

    // 1. check for folders
    let path = '';
    fileName = fileName.replace('\\', '/');
    const foundSlash = fileName.lastIndexOf('/');
    if (foundSlash > -1) {
      path = fileName.substring(0, foundSlash + 1); // path with slash
      fileName = fileName.substring(foundSlash + 1);
    }

    // 2. check if extension already provided, otherwise or if not perfect, just attach default
    if (!fileName.endsWith(this.file.ext)) {
      fileName += this.file.ext;
    }

    // 3. check if cshtmls have a "_" in the file name (not folder, must be the file name part)
    if (this.file.prefix !== '' && fileName[0] !== this.file.prefix) {
      fileName = this.file.prefix + fileName;
    }

    const fullPath = path + fileName;
    angularConsoleLog(fullPath);

    // 4. tell service to create it
    this.svcCurrent.create(fullPath, this.file.body).pipe(take(1)).subscribe(
      (res: boolean) => {
        if (res === false) {
          alert('server reported that create failed - the file probably already exists'); // todo: i18n
        } else {
          // set the dropdown to the new file
          this.templates.push(fullPath);
          this.group.controls[this.config.field.name].setValue(fullPath);
        }
      }
    );
  }

  ngOnDestroy() {
    this.typeWatcher.destroy();
    this.locWatcher.destroy();
  }
}
