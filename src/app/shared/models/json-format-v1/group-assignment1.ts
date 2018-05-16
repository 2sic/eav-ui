import { EavGroupAssignment } from '../eav/eav-group-assignment';

export class GroupAssignment1 {
    Guid: string;
    Part: string;
    Index: number;
    Add: boolean;
    SlotCanBeEmpty: boolean;
    SlotIsEmpty: boolean;
    ContentBlockAppId: number;

    constructor(guid: string, part: string, index: number, add: boolean,
        slotCanBeEmpty: boolean, slotIsEmpty: boolean, contentBlockAppId: number) {
        this.Guid = guid;
        this.Part = part;
        this.Index = index;
        this.Add = add;
        this.SlotCanBeEmpty = slotCanBeEmpty;
        this.SlotIsEmpty = slotIsEmpty;
        this.ContentBlockAppId = contentBlockAppId;
    }

    public static create(eavGroupAssignment: EavGroupAssignment): GroupAssignment1 {
        return eavGroupAssignment ? new GroupAssignment1(eavGroupAssignment.guid, eavGroupAssignment.part, eavGroupAssignment.index,
            eavGroupAssignment.add, eavGroupAssignment.slotCanBeEmpty, eavGroupAssignment.slotIsEmpty,
            eavGroupAssignment.contentBlockAppId) : null;
    }
}
