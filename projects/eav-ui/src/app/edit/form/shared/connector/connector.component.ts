import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { ConnectorHelper } from './connector.helper';
import { FieldState } from '../../builder/fields-builder/field-state';
import { transient } from 'projects/eav-ui/src/app/core';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;
const nameOfThis = 'ConnectorComponent';

@Component({
  selector: 'app-connector',
  templateUrl: './connector.component.html',
  styleUrls: ['./connector.component.scss'],
  standalone: true,
})
export class ConnectorComponent implements AfterViewInit {

  /** Child tag which will contain the inner html */
  @ViewChild('customElContainer') private customElContainerRef: ElementRef;

  protected fieldState = inject(FieldState);
  private connectorCreator = transient(ConnectorHelper);
  private viewContainerRef = inject(ViewContainerRef);
  private changeDetectorRef = inject(ChangeDetectorRef);

  private log = new EavLogger(nameOfThis, logThis);

  constructor() { }

  ngAfterViewInit() {
    const l = this.log.fn('ngAfterViewInit');
    const componentTag = history?.state?.componentTag || `field-${this.fieldState.config.inputType}-dialog`;
    l.a('Connector created for:', { componentTag });
    this.connectorCreator.init(
      componentTag,
      this.customElContainerRef,
      this.viewContainerRef,
      this.changeDetectorRef,
    );
  }

}
