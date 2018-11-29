import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { AdamConfig, AdamModeConfig } from '../../../../shared/models/adam/adam-config';
import { DnnBridgeService } from '../../../../shared/services/dnn-bridge.service';
import { EavService } from '../../../../shared/services/eav.service';
import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { FileTypeService } from '../../../../shared/services/file-type.service';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'hyperlink-default',
  templateUrl: './hyperlink-default.component.html',
  styleUrls: ['./hyperlink-default.component.scss']
})
@InputType({
  wrapper: ['app-simple-dropzone-wrapper', 'app-eav-localization-wrapper', 'app-hyperlink-default-expandable-wrapper', 'app-dropzone'],
})
export class HyperlinkDefaultComponent implements Field, OnInit, OnDestroy {
  @Input() config: FieldConfig;
  group: FormGroup;

  showPreview = true;
  toggleAdamValue = false;
  link = '';
  showFieldHints;

  // TODOD: temp
  private eavConfig;

  // adam: any;
  private subscriptions: Subscription[] = [];

  private adamModeConfig: AdamModeConfig = {
    usePortalRoot: false
  };

  get value() {
    return this.group.controls[this.config.name].value;
  }

  get disabled() {
    return this.group.controls[this.config.name].disabled;
  }

  // ensureDefaultConfig();
  get showAdam() {
    // this.config.settings.ShowAdam.values.Where(v => v.Dimensions.Contains("en-en").value) or values[0]
    // then the wrapper will enable/disable the field, depending on the dimension state\
    // so if it's read-only sharing, the input-field is disabled till the globe is clicked to enable edit...
    return this.config.settings.ShowAdam ? this.config.settings.ShowAdam : true;
  }

  get fileFilter() {
    return this.config.settings.FileFilter || '';
  }

  get buttons(): string {
    return this.config.settings.Buttons ? this.config.settings.Buttons : 'adam,more';
  }

  constructor(private fileTypeService: FileTypeService,
    private dnnBridgeService: DnnBridgeService,
    private eavService: EavService,
    private dialog: MatDialog) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    this.attachAdam();
    this.setLink(this.value);
    this.suscribeValueChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  private setFormValue(formControlName: string, value: any) {
    this.group.patchValue({ [formControlName]: value });
  }

  isImage = () => this.fileTypeService.isImage(this.link);

  icon = () => this.fileTypeService.getIconClass(this.link);

  thumbnailUrl(size: number, quote: boolean) {
    let result = this.link;
    if (size === 1) {
      result = result + '?w=72&h=72&mode=crop';
    }
    if (size === 2) {
      result = result + '?w=960&h=960&mode=max';
    }
    const qt = quote ? '"' : '';
    return qt + result + qt;
  }

  tooltipUrl = (str: string): string => {
    if (!str) {
      return '';
    }
    return str.replace(/\//g, '/&#8203;');
  }

  //#region dnn-page picker dialog

  // the callback when something was selected
  private processResultOfPagePicker(value) {
    // Convert to page:xyz format (if it wasn't cancelled)
    if (value) {
      this.setFormValue(this.config.name, `page:${value.id}`);
    }
  }

  // open the dialog
  openPageDialog() {
    this.dnnBridgeService.open(
      this.value,
      {
        Paths: this.config.settings.Paths ? this.config.settings.Paths : '',
        FileFilter: this.config.settings.FileFilter ? this.config.settings.FileFilter : ''
      },
      this.processResultOfPagePicker.bind(this),
      this.dialog);
  }

  //#endregion dnn page picker

  //#region new adam: callbacks only

  setValue(fileItem) {
    this.setFormValue(this.config.name, `File:${fileItem.Id}`);
  }

  toggleAdam(usePortalRoot, showImagesOnly) {
    this.config.adam.toggle({
      showImagesOnly: showImagesOnly,
      usePortalRoot: usePortalRoot
    });
  }

  /**
 * subscribe to form value changes. Only this field change
 *
 */
  private suscribeValueChanges() {
    this.subscriptions.push(
      this.group.controls[this.config.name].valueChanges.subscribe((item) => {
        console.log('suscribeValueChanges CHANGE');
        this.setLink(item);
      })
    );
  }

  /**
   * Update test-link if necessary - both when typing or if link was set by dialogs
   * @param value
   */
  private setLink(value: string) {
    // const oldValue = this.value;
    if (!value) {
      return null;
    }
    // handle short-ID links like file:17
    const urlFromId$ = this.dnnBridgeService.getUrlOfId(this.eavConfig.appId,
      value,
      this.config.header.contentTypeName,
      this.config.header.guid,
      this.config.name);

    if (urlFromId$) {
      // this.subscriptions.push(
      urlFromId$.subscribe((data) => {
        if (data) {
          this.link = data;
        }
      });
      // );
    } else {
      this.link = value;
    }
  }

  private attachAdam() {
    if (this.config.adam) {
      // callbacks - functions called from adam
      this.config.adam.updateCallback = (value) => this.setValue(value);

      // binding for dropzone
      this.config.adam.afterUploadCallback = (value) => this.setValue(value);

      // return value from form
      this.config.adam.getValueCallback = () => this.group.controls[this.config.name].value;

      // set adam configuration (initial config)
      // this.config.adam.setConfig(
      //   new AdamConfig(this.adamModeConfig,
      //     true, // allowAssetsRoot
      //     false, // autoLoad
      //     true, // enableSelect
      //     this.fileFilter, // fileFilter
      //     0, // folderDepth
      //     '', // metadataContentTypes
      //     '', // subFolder
      //   )
      // );
      console.log('HyperDefault setConfig : ', Object.assign(new AdamConfig(), {
        adamModeConfig: this.adamModeConfig,
        fileFilter: this.fileFilter
      }));

      this.config.adam.setConfig(Object.assign(new AdamConfig(), {
        adamModeConfig: this.adamModeConfig,
        fileFilter: this.fileFilter
      }));
      //   new AdamConfig(this.adamModeConfig,
      //     true, // allowAssetsInRoot
      //     false, // autoLoad
      //     true, // enableSelect
      //     this.fileFilter, // fileFilter
      //     0, // folderDepth
      //     '', // metadataContentTypes
      //     '', // subFolder


    }
  }

  //#endregion
}
