import { Observable } from 'rxjs/Observable';

export class Connector {
    config$: Observable<any>; // todo should contain the field configuration, like default values etc.
    state: any; // todo should contain field state like disabled, language, etc.
    form: any; // todo should contain read/write of other fields
    data: ConnectorData; // current field data, read/write or get other languages
}

export class ConnectorData {
    // value$: Observable<any>;
    // getValue(): any;
    field: any;
    myObservable: Observable<any>;
    update: ConnectorDataUpdate;
    addValueChangeListener: (callback: ValueChangeListenerCallback) => void;
    removeValueChangeListener: (callback: ValueChangeListenerCallback) => void;
}

export type ConnectorDataUpdate = (newValue: string) => void;
export type ValueChangeListenerCallback = (newValue: string) => void;
