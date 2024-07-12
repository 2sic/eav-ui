import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { consoleLogDev } from '../../../../shared/helpers/console-log-angular.helper';
import { ConnectorHelper } from './connector.helper';
import { FieldState } from '../../builder/fields-builder/field-state';

@Component({
  selector: 'app-connector',
  templateUrl: './connector.component.html',
  styleUrls: ['./connector.component.scss'],
  standalone: true,
  providers: [
    ConnectorHelper,
  ],
})
export class ConnectorComponent implements AfterViewInit {

  /** Child tag which will contain the inner html */
  @ViewChild('customElContainer') private customElContainerRef: ElementRef;

  protected fieldState = inject(FieldState);
  private connectorCreator = inject(ConnectorHelper);
  private viewContainerRef = inject(ViewContainerRef);
  private changeDetectorRef = inject(ChangeDetectorRef);

  constructor() { }

  ngAfterViewInit() {
    const componentTag = history?.state?.componentTag || `field-${this.fieldState.config.inputType}-dialog`;
    consoleLogDev('Connector created for:', componentTag);
    this.connectorCreator.init(
      componentTag,
      this.customElContainerRef,
      this.viewContainerRef,
      this.changeDetectorRef,
    );
  }

}
