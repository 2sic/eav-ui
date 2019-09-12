import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { InputType as InputTypeModel } from '../../../../../../../../Projects/eav-item-dialog-angular/src/app/shared/models/eav';
import { InputTypeService } from '../../../../shared/store/ngrx-data/input-type.service';
import { ScriptsLoaderService } from '../../../../shared/services/scripts-loader.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'external-webcomponent',
  templateUrl: './external-webcomponent.component.html',
  styleUrls: ['./external-webcomponent.component.scss']
})
@InputType({})
export class ExternalWebcomponentComponent implements OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  loadingSpinner = true;
  shouldShowConnector = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private inputTypeService: InputTypeService,
    private scriptsLoaderService: ScriptsLoaderService,
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this.config.field.expanded.subscribe(expanded => { this.shouldShowConnector = expanded; }),
    );
    this.loadAssets();
  }

  private loadAssets() {
    let inputType: InputTypeModel;
    this.inputTypeService.getInputTypeById(this.config.field.inputType).pipe(take(1)).subscribe(type => { inputType = type; });

    const assets = inputType.AngularAssets.split('\n');
    if (assets.length === 0) { return; }
    this.scriptsLoaderService.load(assets, this.assetsLoaded.bind(this));
  }

  private assetsLoaded() {
    console.log('ExternalWebcomponentComponent', this.config.field.name, 'loaded');
    this.loadingSpinner = false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
  }
}
