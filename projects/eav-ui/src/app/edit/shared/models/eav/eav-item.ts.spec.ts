import { EavItem } from "./eav-item";
import { EavType } from "./eav-type";

const eavItem: EavItem = {
    Entity: {
        Attributes: {
            StringTest: {
                Values: [{ value: 'Test State Data 2dg', dimensions: [{ dimCode: '*' }] }],
                Type: 'String',
            },
            NumberTest: {
                Values: [{ value: 42, dimensions: [{ dimCode: '*' }] }],
                Type: 'Number',
            },
        },
        Guid: "e1703260-33c9-4171-b207-f19fcd048621",
        Id: 0,
        Owner: "",
        Type: { Id: '77138e24-1d78-4dba-b4b1-4c672834e497', Name: 'Demo2dg' } as EavType,
        Version: 1
    },
    Header: {
        Add: null,
        ClientData: {
            overrideContents: {
                StringTest: "Debug: Image comparison started"
            }
        },
        ContentTypeName: "77138e24-1d78-4dba-b4b1-4c672834e497",
        DuplicateEntity: null,
        EditInfo: {
            ReadOnly: false
        },
        EntityId: 0,
        For: null,
        // Guid: "35f9d699-557f-4aea-8176-34deb7b306c8",
        Index: null,
        IsEmpty: false,
        IsEmptyAllowed: false,
        Prefill: undefined,
        clientId: 0
    }
}

describe('EavItem.eavToObj', () => {
    it('should convert EavItem back to simple object', () => {

        const result = EavItem.eavToObj(eavItem);
        expect(result).toEqual({
            StringTest: 'Test State Data 2dg',
            NumberTest: 42,
        });
    });
});
