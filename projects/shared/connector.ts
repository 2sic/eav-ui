import { Observable } from 'rxjs/Observable';
// import { FieldConfig } from './field-config';

export interface ConnectorObservable<T> extends Connector<T> {
    // field$: Observable<FieldConfig>;
    data: ConnectorDataObservable<T>; // current field data, read/write or get other languages
}

export interface Connector<T> {
    /** Contains field configuration */
    // field: FieldConfig;

    /** read / update stuff for the other fields or form */
    // form: any;

    /** current field data, read/write or get other languages */
    data: ConnectorData<T>;

    /** this is fired whenever anything changes - incl. config, language, etc. */
    // onStateChange: (callback: () => void) => void;
}

export interface ConnectorDataObservable<T> extends ConnectorData<T> {
    /** Observable which returns new value on each value update */
    value$: Observable<T>;
}

export interface ConnectorData<T> {
    /** Current value of the field */
    value: T;
    /**
     * Client updates value in the host
     * @param newValue - New value of the field from the client
     */
    update: (newValue: T) => void;
    /**
     * Client adds callback functions to be executed every time value changes in the host
     * @param callback - Function to be executed every time value changes in the host
     */
    onValueChange: (callback: (newValue: T) => void) => void;
}
