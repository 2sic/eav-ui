import { GroupAssignment1 } from '../json-format-v1/group-assignment1';

export class EavGroupAssignment {
    guid: string;
    part: string;
    index: number;
    add: boolean;
    slotCanBeEmpty: boolean;
    slotIsEmpty: boolean;
    contentBlockAppId: number;

    constructor(guid: string, part: string, index: number, add: boolean,
        slotCanBeEmpty: boolean, slotIsEmpty: boolean, contentBlockAppId: number) {
        this.guid = guid;
        this.part = part;
        this.index = index;
        this.add = add;
        this.slotCanBeEmpty = slotCanBeEmpty;
        this.slotIsEmpty = slotIsEmpty;
        this.contentBlockAppId = contentBlockAppId;
    }

    public static create(groupAssignment1: GroupAssignment1): EavGroupAssignment {
        return groupAssignment1 ? new EavGroupAssignment(groupAssignment1.Guid, groupAssignment1.Part, groupAssignment1.Index,
            groupAssignment1.Add, groupAssignment1.SlotCanBeEmpty, groupAssignment1.SlotIsEmpty,
            groupAssignment1.ContentBlockAppId) : null;
    }
}
