import { Observable } from 'rxjs/Observable';
import { ConnectorObservable, ConnectorDataObservable } from '../../../../../../projects/shared/connector';
import { ExternalWebcomponentComponent } from './external-webcomponent.component';

export class ConnectorInstance<T> implements ConnectorObservable<T> {
    state$: any; // todo should contain field state like disabled, language, etc.
    data: ConnectorDataObservable<T>;

    constructor(
        host: ExternalWebcomponentComponent,
        value$: Observable<T>
    ) {
        this.data = new ConnectorDataInstance<T>(host, value$);
    }
}

export class ConnectorDataInstance<T> implements ConnectorDataObservable<T> {
    field: any;
    value$: Observable<T>;
    clientValueChangeListeners: ((newValue: T) => void)[];

    constructor(
        private host: ExternalWebcomponentComponent,
        value$: Observable<T>
    ) {
        this.clientValueChangeListeners = [];
        this.field = host.group.controls[host.config.currentFieldConfig.name];
        this.value$ = value$;
        // Host will complete this observable. Therefore unsubscribe is not required
        this.value$.subscribe(newValue => {
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
