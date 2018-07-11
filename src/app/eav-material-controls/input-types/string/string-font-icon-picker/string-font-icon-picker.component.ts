import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
// import { map } from 'rxjs/operators/map';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { Field } from '../../../../eav-dynamic-form/model/field';
import { ScriptLoaderService, ScriptModel } from '../../../../shared/services/script.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-font-icon-picker',
  templateUrl: './string-font-icon-picker.component.html',
  styleUrls: ['./string-font-icon-picker.component.css']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class StringFontIconPickerComponent implements Field, OnInit {
  @Input() config: FieldConfig;
  group: FormGroup;

  // icons$: [{ rule: CSSStyleSheet, 'class': string }] = ;
  icons = [];
  filteredIcons: Observable<{ rule: CSSStyleRule, class: string }>;

  get files(): string {
    return this.config.settings.Files ? this.config.settings.Files : '';
  }

  get prefix(): string {
    return this.config.settings.CssPrefix ? this.config.settings.CssPrefix : '';
  }

  get previewCss(): string {
    return this.config.settings.PreviewCss ? this.config.settings.PreviewCss : '';
  }

  constructor(private scriptLoaderService: ScriptLoaderService) { }

  ngOnInit() {
    //   this.getIconClasses(this.prefix);
    console.log('loadAdditionalResources', this.files);
    this.loadAdditionalResources(this.files);
  }

  get value() {
    return this.group.controls[this.config.name].value;
  }

  setIcon(iconClass: any, formControlName: string) {
    this.group.patchValue({ [formControlName]: iconClass });
  }

  getIconClasses(className) {
    const charcount = className.length, foundList = [], duplicateDetector = {};

    if (!className) {
      return foundList;
    }

    for (let ssSet = 0; ssSet < document.styleSheets.length; ssSet++) {
      // const classes = document.styleSheets[ssSet].rules || document.styleSheets[ssSet].cssRules;
      // TEMP: look only bootstrap-glyphicons.css
      // tslint:disable-next-line:max-line-length
      if ((<CSSStyleSheet>document.styleSheets[ssSet]).href === 'http://2sxc-dnn742.dnndev.me/DesktopModules/ToSIC_SexyContent/dist/ng-edit/assets/style/bootstrap-glyphicons.css') {
        const classes = (<CSSStyleSheet>document.styleSheets[ssSet]).rules;

        if (classes) {
          for (let x = 0; x < classes.length; x++) {
            if ((<CSSStyleRule>classes[x]).selectorText && (<CSSStyleRule>classes[x]).selectorText.substring(0, charcount) === className) {
              // prevent duplicate-add...
              const txt = (<CSSStyleRule>classes[x]).selectorText,
                icnClass = txt.substring(0, txt.indexOf(':')).replace('.', '');
              if (!duplicateDetector[icnClass]) {
                foundList.push({ rule: classes[x], 'class': icnClass });
                duplicateDetector[icnClass] = true;
              }
            }
          }
        }
      }
    }
    // this.icons$ = foundList;
    this.icons.push(...foundList);
    // return foundList;
  }

  // TODO: read CSS file
  //     function loadAdditionalResources(files) {
  //   files = files || "";
  //   var mapped = files.replace("[App:Path]", appRoot)
  //     .replace(/([\w])\/\/([\w])/g,   // match any double // but not if part of https or just "//" at the beginning
  //       "$1/$2");
  //   var fileList = mapped ? mapped.split("\n") : [];
  //   return $ocLazyLoad.load(fileList);
  // }

  loadAdditionalResources(files: string) {
    // const mapped = this.files.replace('[App:Path]', appRoot)
    // TODO: App root read
    const mapped = files.replace('[App:Path]', 'http://2sxc-dnn742.dnndev.me/Portals/0/2sxc/QR Code')
      .replace(/([\w])\/\/([\w])/g,   // match any double // but not if part of https or just "//" at the beginning
        '$1/$2');
    const fileList = mapped ? mapped.split('\n') : [];

    const scriptModelList: ScriptModel[] = [];
    fileList.forEach((element, index) => {
      const scriptModel: ScriptModel = {
        name: element,
        filePath: element,
        loaded: false
      };
      scriptModelList.push(scriptModel);
    });

    console.log('scriptModelList', scriptModelList);
    this.scriptLoaderService.loadList(scriptModelList, 'css').subscribe(s => {
      if (s !== null) {
        console.log('all scripts loaded successfully', s);
        this.getIconClasses(this.prefix);
      }
    });
  }
}
