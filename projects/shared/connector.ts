import { Observable } from 'rxjs/Observable';

export class Connector {
    config$: Observable<any>; // todo should contain the field configuration, like default values etc.
    state: any; // todo should contain field state like disabled, language, etc.
    form: any; // todo should contain read/write of other fields
    data: ConnectorData; // current field data, read/write or get other languages
    callback: Function;
    onChange = (callback: Function) => {
        this.callback = callback;
    }
}

type OnChangeCallback = (n: any) => void;

export interface ConnectorData {
    // value$: Observable<any>;
    // getValue(): any;
    field: any;
    myObservable: Observable<any>;
    update(newValue: string): any;
    // onChange(changeEvent: OnChangeCallback): any;
}

// let data: ConnectorData;
// data.onChange((newValue) => {this.value = newValue;});
