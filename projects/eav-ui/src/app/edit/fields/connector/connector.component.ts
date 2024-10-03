import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { transient } from '../../../../../../core/transient';
import { classLog } from '../../../shared/logging';
import { FieldState } from '../field-state';
import { ConnectorHelper } from './connector.helper';

@Component({
  selector: 'app-connector',
  templateUrl: './connector.component.html',
  standalone: true,
})
export class ConnectorComponent implements AfterViewInit {

  log = classLog({ConnectorComponent});

  /** Child tag which will contain the inner html */
  @ViewChild('customElContainer') private customElContainerRef: ElementRef;

  protected fieldState = inject(FieldState);
  private connectorCreator = transient(ConnectorHelper);
  private viewContainerRef = inject(ViewContainerRef);
  private changeDetectorRef = inject(ChangeDetectorRef);

  constructor() { }

  ngAfterViewInit() {
    const l = this.log.fn('ngAfterViewInit');
    const componentTag = history?.state?.componentTag || this.fieldState.config.inputTypeSpecs.componentTagDialogName;
    l.a('Connector created for:', { componentTag });
    this.connectorCreator.init(
      componentTag,
      this.customElContainerRef,
      this.viewContainerRef,
      this.changeDetectorRef,
    );
  }

}
