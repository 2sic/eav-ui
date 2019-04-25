import { Component, Input, NgZone, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'external-webcomponent',
  templateUrl: './external-webcomponent.component.html',
  styleUrls: ['./external-webcomponent.component.scss']
})
@InputType({
  // wrapper: ['app-dropzone-wrapper', 'app-eav-localization-wrapper', 'app-expandable-wrapper', 'app-adam-attach-wrapper']
})
export class ExternalWebcomponentComponent implements OnInit {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  loadingSpinner = true;

  constructor(
    private _ngZone: NgZone,
  ) {
  }

  ngOnInit() {
    // load external scripts here. When they are loaded update loadingSpinner = false;
  }

  /**
   * This methos is called when all scripts and styles are loaded
   * (scripts are registering element, then we create that web component element)
   */
  public renderWebComponent = () => {
    this._ngZone.run(() => this.createElementWebComponent());
  }

  private createElementWebComponent() {
    console.log('ExternalWebcomponentComponent', this.config.field.name, 'loaded');
    this.loadingSpinner = false;
  }

  shouldShowConnector() {
    if (!this.config.field.wrappers.includes(WrappersConstants.expandableWrapperV2)) { return true; }
    return this.config.field.expanded;
  }
}
