// import { GroupAssignment1 } from '../json-format-v1/group-assignment1';

export class EavGroupAssignment {
    Guid: string;
    Part: string;
    Index: number;
    Add: boolean;
    SlotCanBeEmpty: boolean;
    SlotIsEmpty: boolean;
    ContentBlockAppId: number;

    // private constructor(guid?: string, part?: string, index?: number, add?: boolean,
    //     slotCanBeEmpty?: boolean, slotIsEmpty?: boolean, contentBlockAppId?: number) {
    //     this.Guid = guid;
    //     this.Part = part;
    //     this.Index = index;
    //     this.Add = add;
    //     this.SlotCanBeEmpty = slotCanBeEmpty;
    //     this.SlotIsEmpty = slotIsEmpty;
    //     this.ContentBlockAppId = contentBlockAppId;
    // }

    //     public static create(groupAssignment1: GroupAssignment1): EavGroupAssignment {
    //         const group: EavGroupAssignment = groupAssignment1 ? { ...groupAssignment1 } : null;
    //         return group;
    //     }
}
