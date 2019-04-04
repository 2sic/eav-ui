import { Observable } from 'rxjs/Observable';
import { ConnectorObservable, ConnectorDataObservable } from '../../../../../../projects/shared/connector';
import { ExternalWebcomponentComponent } from './external-webcomponent.component';
import { FieldConfig } from '../../../../../../projects/shared/field-config';

export class ConnectorInstance<T> implements ConnectorObservable<T> {
    field$: Observable<FieldConfig>;
    field: FieldConfig;
    data: ConnectorDataObservable<T>;

    constructor(
        host: ExternalWebcomponentComponent,
        value$: Observable<T>,
        field: FieldConfig,
    ) {
        this.field = field;
        this.data = new ConnectorDataInstance<T>(host, value$);
    }
}

export class ConnectorDataInstance<T> implements ConnectorDataObservable<T> {
    value$: Observable<T>;
    value: T;
    clientValueChangeListeners: ((newValue: T) => void)[] = [];

    constructor(
        private host: ExternalWebcomponentComponent,
        value$: Observable<T>
    ) {
        this.value$ = value$;
        // Host will complete this observable. Therefore unsubscribe is not required
        this.value$.subscribe(newValue => {
            this.value = newValue;
            this.clientValueChangeListeners.forEach(clientListener => clientListener(newValue));
        });
    }

    update(newValue: T) {
        this.host.externalInputTypeHost.update(newValue as unknown as string);
    }

    onValueChange(callback: (newValue: T) => void) {
        this.clientValueChangeListeners.push(callback);
    }
}
