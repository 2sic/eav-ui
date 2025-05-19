// import { ItemIdentifierHeader } from "projects/eav-ui/src/app/shared/models/edit-form.model";
// import { EavEntityDto } from "../json-format-v1";
// import { EavItem } from "./eav-item";
// import { EavType } from "./eav-type";

// const entityDto: EavEntityDto = {
//   Attributes: {},
//   Guid: "e1703260-33c9-4171-b207-f19fcd048621",
//   Id: 0,
//   Owner: "",
//   Type: { Id: '77138e24-1d78-4dba-b4b1-4c672834e497', Name: 'Demo2dg' } as EavType,
//   Version: 1
// }


// const headerData: ItemIdentifierHeader = {
//   Add: null,
//   ClientData: {
//     overrideContents: {
//       StringTest: "Debug: Image comparison started"
//     }
//   },
//   ContentTypeName: "77138e24-1d78-4dba-b4b1-4c672834e497",
//   DuplicateEntity: null,
//   EditInfo: {
//     ReadOnly: false
//   },
//   EntityId: 0,
//   For: null,
//   // Guid: "35f9d699-557f-4aea-8176-34deb7b306c8",
//   Index: null,
//   IsEmpty: false,
//   IsEmptyAllowed: false,
//   Prefill: undefined,
//   clientId: 0
// };


// const demoObj = {
//   override: {
//     StringTest: 'Debug: Image comparison started',
//   }
// };

// describe('objToEav()', () => {
//   it('should convert override object into EavItem format', () => {
//     const result = EavItem.objToEav(demoObj.override, headerData, entityDto);
//     // testing attribute in EavItem 
//     expect(result.Entity.Attributes).toEqual({
//       StringTest: {
//         Values: [{ value: 'Debug: Image comparison started', dimensions: null }],
//         Type: 'String'
//       },
//     });
//   });


// });
