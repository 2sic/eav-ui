import { Component, Input, NgZone, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

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
export class ExternalWebcomponentComponent implements OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  loadingSpinner = true;
  shouldShowConnector = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private _ngZone: NgZone,
  ) {
  }

  ngOnInit() {
    // spm load external scripts here. When they are loaded update loadingSpinner = false;

    if (!this.config.field.wrappers.includes(WrappersConstants.expandableWrapperV2)) {
      this.shouldShowConnector = true;
    } else {
      this.subscriptions.push(
        this.config.field.expanded.subscribe(expanded => { this.shouldShowConnector = expanded; }),
      );
    }
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

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
  }
}
