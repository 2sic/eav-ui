import { EavValue } from './eav-value';
import { Attributes1 } from '../json-format-v1/attributes1';

export class EavAttribute<T> {
    [key: string]: EavValue<T>;
}

/* "Attributes": {
    "String": {
        "Description": {
            "*": "Retrieve full list of all zones"
        },
        "Name": {
            "*": "Zones"
        },
        "StreamsOut": {
            "*": "ListContent,Default"
        },
        "StreamWiring": {
            "*": "3cef3168-5fe8-4417-8ee0-c47642181a1e:Default>Out:Default"
        },
        "TestParameters": {
            "*": "[Module:ModuleID]=6936"
        }
    },
    "Boolean": {
        "AllowEdit": {
            "*": true
        }
    }
}, */
