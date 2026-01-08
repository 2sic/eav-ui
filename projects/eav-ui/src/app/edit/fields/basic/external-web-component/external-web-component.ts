import { Component, inject, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging';
import { ScriptsLoaderService } from '../../../shared/services/scripts-loader.service';
import { ConnectorComponent } from '../../connector/connector';
import { FieldState } from '../../field-state';
import { CustomGpsLogic } from './custom-gps-settings-helper';
import { StringWysiwygLogic } from './string-wysiwyg-settings-helper';

@Component({
  selector: InputTypeCatalog.ExternalWebComponent,
  templateUrl: './external-web-component.html',
  imports: [
    MatProgressSpinnerModule,
    ConnectorComponent,
  ]
})
export class ExternalWebComponentComponent {

  log = classLog({ExternalWebComponentComponent});

  protected fieldState = inject(FieldState);
  protected config = this.fieldState.config;
 
  protected loading = signal<boolean>(true)

  constructor(
    private scriptsLoaderService: ScriptsLoaderService,
  ) {
    StringWysiwygLogic.importMe();
    CustomGpsLogic.importMe();
  }

  ngOnInit() {
    this.loadAssets();
  }

  private loadAssets() {
    const assets = this.config.inputTypeSpecs.metadata.UiAssets?.default?.split('\n') ?? [];
    if (assets.length === 0)
      return;
    this.scriptsLoaderService.load(assets, this.assetsLoaded.bind(this));
  }

  private assetsLoaded() {
    this.log.fn('assetsLoaded ' + this.config.fieldName);
    this.loading.set(false);
  }
}
