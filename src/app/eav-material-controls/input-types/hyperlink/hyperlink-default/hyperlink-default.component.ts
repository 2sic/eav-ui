import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { FileTypeService } from '../../../../shared/services/file-type.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'hyperlink-default',
  templateUrl: './hyperlink-default.component.html',
  styleUrls: ['./hyperlink-default.component.css']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class HyperlinkDefaultComponent implements Field {
  @Input() config: FieldConfig;
  group: FormGroup;

  showPreview;
  toggleAdamValue = false;
  testLink = '/assets/images/smallImage.jpg';
  showFieldHints;

  adam: any;

  private adamModeConfig = {
    usePortalRoot: false
  };

  get value() {
    return this.group.controls[this.config.name].value;
  }

  // ensureDefaultConfig();
  get showAdam() {
    // this.config.settings.ShowAdam.values.Where(v => v.Dimensions.Contains("en-en").value) or values[0]
    // then the wrapper will enable/disable the field, depending on the dimension state\
    // so if it's read-only sharing, the input-field is disabled till the globe is clicked to enable edit...
    return this.config.settings.ShowAdam ? this.config.settings.ShowAdam : true;
  }

  get buttons(): string {
    return this.config.settings.Buttons ? this.config.settings.Buttons : 'adam,more';
  }

  constructor(private fileTypeService: FileTypeService) { }

  private setFormValue(formControlName: string, value: any) {
    this.group.patchValue({ [formControlName]: value });
  }

  isImage = () => this.fileTypeService.isImage(this.testLink);

  icon = () => this.fileTypeService.getIconClass(this.testLink);

  thumbnailUrl(size: number, quote: boolean) {
    let result = this.testLink;
    if (size === 1) {
      result = result + '?w=64&h=64&mode=crop';
    }
    if (size === 2) {
      result = result + '?w=500&h=400&mode=max';
    }
    const qt = quote ? '"' : '';
    return qt + result + qt;
  }

  tooltipUrl = (str: string) => str.replace(/\//g, '/&#8203;');

  // Update test-link if necessary - both when typing or if link was set by dialogs
  //   $scope.$watch("value.Value", function(newValue, oldValue) {
  //     if (!newValue)
  //         return;

  //     // handle short-ID links like file:17
  //     var promise = dnnBridgeSvc.getUrlOfId(newValue);
  //     if(promise)
  //         promise.then(function (result) {
  //             if (result.data)
  //                 vm.testLink = result.data;
  //         });
  //     else
  //         vm.testLink = newValue;
  // });

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
    console.log('openPageDialog');
    // dnnBridgeSvc.open(
    //   this.value,
    //   {
    //     Paths: this.config.settings.Paths ? this.config.settings.Paths.values[0].value : '',
    //     FileFilter: this.config.settings.FileFilter ? this.config.settings.FileFilter : ''
    //   },
    //   this.processResultOfPagePicker);
  }

  //#endregion dnn page picker

  //#region new adam: callbacks only
  registerAdam(adam) {
    this.adam = adam;
  }

  setValue(fileItem) {
    this.setFormValue(this.config.name, `File:${fileItem.id}`);
  }

  // afterUpload = setValue;   // binding for dropzone

  toggleAdam(usePortalRoot, imagesOnly) {
    console.log('toggle addam first:', usePortalRoot);
    console.log('toggle addam second:', imagesOnly);
    // this.adam.toggle({
    //   showImagesOnly: imagesOnly,
    //   usePortalRoot: usePortalRoot
    // });
  }

  //#endregion adam: callbacks only
}
