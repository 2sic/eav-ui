export class Attribute1 {
    Name: string;
    Type: string;
    IsTitle: boolean;

    constructor(Name: string, Type: string, IsTitle: boolean) {
        this.Name = Name;
        this.Type = Type;
        this.IsTitle = IsTitle;
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
