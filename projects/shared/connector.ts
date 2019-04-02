import { Observable } from 'rxjs/Observable';
// import { EavAttributesTranslated } from 'src/app/shared/models/eav';

export interface ConnectorObservable<T> extends Connector<T> {
    state$: any; // todo should contain field state like disabled, language, etc.
    data: ConnectorDataObservable<T>; // current field data, read/write or get other languages
}

export interface Connector<T> {
    /** this should be a field configuration. This is basically field settings from field config */
    // settings: EavAttributesTranslated;

    /** todo should contain field state like disabled, language, etc. */
    // state: any;

    /** read / update stuff for the other fields or form */
    // form: any;

    /** current field data, read/write or get other languages */
    data: ConnectorData<T>;

    /** this is fired whenever anything changes - incl. config, language, etc. */
    // onStateChange: (callback: () => void) => void;
}

export interface ConnectorDataObservable<T> extends ConnectorData<T> {
    value$: Observable<T>;
}

export interface ConnectorData<T> {
    /**
     * Current value of the field
     */
    value: T;
    /**
     * Client updates value in host
     * @param newValue - New value of the field from the client
     */
    update: (newValue: T) => void;
    /**
     * Client adds callback functions to be executed every time value changes in the host
     * @param callback - Function to be executed every time value changes in the host
     */
    onValueChange: (callback: (newValue: T) => void) => void;
}
