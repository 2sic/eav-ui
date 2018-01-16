import { EavValue } from './eav-value';
import { Attribute1 } from '../json-format-v1/attribute1';

export class EavAttribute<T> {
    [key: string]: EavValue<T>;

    /**
     * Create Eav Attribute model from json typed Attribute1
     * @param attribute1
     * @param atributeType
     */
    public static create<T>(attribute1?: Attribute1<T>): EavAttribute<T> {
        if (attribute1 === undefined) {
            return undefined;
        }

        const newEavAtribute: EavAttribute<T> = new EavAttribute<T>();
        // Loop trough attribute - Description, Name ...
        Object.keys(attribute1).forEach(attribute1Key => {
            if (attribute1.hasOwnProperty(attribute1Key)) {
                newEavAtribute[attribute1Key] = EavValue.create('*', attribute1[attribute1Key]['*']);
            }
        });

        return newEavAtribute;
    }
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
