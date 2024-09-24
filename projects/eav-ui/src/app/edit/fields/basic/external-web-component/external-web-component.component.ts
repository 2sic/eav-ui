import { Component, inject, signal } from '@angular/core';
import { CustomGpsLogic } from './custom-gps-logic';
import { StringWysiwygLogic } from './string-wysiwyg-logic';
import { AsyncPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldState } from '../../field-state';
import { ConnectorComponent } from '../../connector/connector.component';
import { ScriptsLoaderService } from '../../../shared/services/scripts-loader.service';
import { EditRoutingService } from '../../../routing/edit-routing.service';
import { classLog } from '../../../../shared/logging';

@Component({
  selector: InputTypeCatalog.ExternalWebComponent,
  templateUrl: './external-web-component.component.html',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    ConnectorComponent,
    AsyncPipe,
  ],
})
export class ExternalWebComponentComponent {

  log = classLog({ExternalWebComponentComponent});

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
    const assets = this.config.inputTypeSpecs.metadata.AngularAssets.split('\n');
    if (assets.length === 0) return;
    this.scriptsLoaderService.load(assets, this.assetsLoaded.bind(this));
  }

  private assetsLoaded() {
    this.log.fn('assetsLoaded ' + this.config.fieldName);
    this.loading.set(false);
  }
}
