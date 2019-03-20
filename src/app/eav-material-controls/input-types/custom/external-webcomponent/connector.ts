import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { Connector, ConnectorDataObservable } from '../../../../../../projects/shared/connector';
import { ExternalWebcomponentComponent } from './external-webcomponent.component';

export class ConnectorInstance implements Connector {
    config$: Observable<any>; // todo should contain the field configuration, like default values etc.
    state: any; // todo should contain field state like disabled, language, etc.
    form: any; // todo should contain read/write of other fields
    data: ConnectorDataObservable; // current field data, read/write or get other languages

    constructor(
        config$: Observable<any>,
        state: any, form: any,
        private host: ExternalWebcomponentComponent,
        private fieldValueChanged$: Observable<string>
    ) {
        this.config$ = config$;
        this.state = state;
        this.form = form;
        this.data = new ConnectorDataInstance(host, fieldValueChanged$);
    }
}

export class ConnectorDataInstance implements ConnectorDataObservable {
    field: any;
    fieldValueChanged$: Observable<string>;
    clientValueChangeListeners: ((newValue: string) => void)[];
    subscriptions: Subscription[];

    constructor(
        private host: ExternalWebcomponentComponent,
        fieldValueChanged$: Observable<string>
    ) {
        this.subscriptions = [];
        this.clientValueChangeListeners = [];
        this.field = host.group.controls[host.config.name];
        this.fieldValueChanged$ = fieldValueChanged$;
        const subscription = this.fieldValueChanged$.subscribe(newValue => {
            this.clientValueChangeListeners.forEach(clientListener => clientListener(newValue));
        });
        this.subscriptions.push(subscription);
    }

    update(newValue: string) {
        this.host.externalInputTypeHost.update(newValue);
    }

    onValueChange(callback: (newValue: string) => void) {
        this.clientValueChangeListeners.push(callback);
    }

    onDestroy() {
        this.clientValueChangeListeners.splice(0);
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
