import { EavValues, EavValue } from '../eav';

export class Value1<T> {
    [key: string]: T;


    public static create<T>(eavValues: EavValues<T>): Value1<T> {
        const newValue1 = {};
        console.log('eavValues.values.forEach: ', eavValues.values);
        eavValues.values.forEach(eavValue => {
            const allDimensions = eavValue.dimensions.map(d => d.value).join();
            newValue1[allDimensions] = eavValue.value;
        });

        return newValue1;
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
