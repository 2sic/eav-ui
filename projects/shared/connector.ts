import { Observable } from 'rxjs/Observable';

export interface Connector {
    config$: Observable<any>; // todo should contain the field configuration, like default values etc.
    state: any; // todo should contain field state like disabled, language, etc.
    form: any; // todo should contain read/write of other fields
    data: ConnectorDataObservable; // current field data, read/write or get other languages
}

export interface ConnectorDataObservable extends ConnectorData {
    fieldValueChanged$: Observable<string>;
}

export interface ConnectorData {
    field: any;
    /**
     * Client updates value in host
     * @param newValue - New value of the field from the client
     */
    update: (newValue: string) => void;
    /**
     * Client adds callback functions to be executed every time value changes in the host
     * @param callback - Function to be executed every time value changes in the host
     */
    onValueChange: (callback: (newValue: string) => void) => void;
}
