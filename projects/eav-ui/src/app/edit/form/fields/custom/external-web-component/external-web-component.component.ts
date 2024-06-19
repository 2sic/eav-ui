import { Component, inject, signal } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { consoleLogEditForm } from '../../../../../shared/helpers/console-log-angular.helper';
import { EditRoutingService, ScriptsLoaderService } from '../../../../shared/services';
import { CustomGpsLogic } from './custom-gps-logic';
import { StringWysiwygLogic } from './string-wysiwyg-logic';
import { AsyncPipe } from '@angular/common';
import { ConnectorComponent } from '../../../shared/connector/connector.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FieldState } from '../../../builder/fields-builder/field-state';

@Component({
  selector: InputTypeConstants.ExternalWebComponent,
  templateUrl: './external-web-component.component.html',
  styleUrls: ['./external-web-component.component.scss'],
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    ConnectorComponent,
    AsyncPipe,
  ],
})
export class ExternalWebComponentComponent {

  protected fieldState = inject(FieldState);
  protected config = this.fieldState.config;

  protected isExpanded = this.editRoutingService.isExpandedSignal(this.config.index, this.config.entityGuid);
  protected loading = signal<boolean>(true)

  constructor(
    private scriptsLoaderService: ScriptsLoaderService,
    private editRoutingService: EditRoutingService,
  ) {
    StringWysiwygLogic.importMe();
    CustomGpsLogic.importMe();
  }

  ngOnInit() {
    this.loadAssets();
  }

  private loadAssets() {
    const assets = this.config.angularAssets.split('\n');
    if (assets.length === 0) { return; }
    this.scriptsLoaderService.load(assets, this.assetsLoaded.bind(this));
  }

  private assetsLoaded() {
    consoleLogEditForm('ExternalWebcomponentComponent', this.config.fieldName, 'loaded');
    this.loading.set(false);
  }
}
