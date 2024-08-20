import { Component, inject, signal } from '@angular/core';
import { CustomGpsLogic } from './custom-gps-logic';
import { StringWysiwygLogic } from './string-wysiwyg-logic';
import { AsyncPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { FieldState } from '../../field-state';
import { ConnectorComponent } from '../../connector/connector.component';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { ScriptsLoaderService } from '../../../shared/services/scripts-loader.service';
import { EditRoutingService } from '../../../shared/services/edit-routing.service';

const logThis = false;
const nameOfThis = 'ExternalWebComponentComponent';

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

  private log = new EavLogger(nameOfThis, logThis);

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
    this.log.fn('assetsLoaded ' + this.config.fieldName);
    this.loading.set(false);
  }
}
