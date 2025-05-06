import { ItemIdentifierHeader } from "projects/eav-ui/src/app/shared/models/edit-form.model";
import { EavItem } from "./eav-item";

const headerData: ItemIdentifierHeader = {
  Add: null,
  ClientData: {
    overrideContents: null,
  },
  clientId: 0,
  ContentTypeName: 'ImageCompare',
  DuplicateEntity: null,
  EditInfo: null,
  EntityId:0,
  For: null,
  // Guid: '',
  Index: null,
  IsEmpty: false,
  IsEmptyAllowed: false,
  Prefill: null,
}

const demoObj = {
  override: {
    DebugLog: 'Debug: Image comparison started',
    Description: 'Compares two images and highlights differences',
    DisplayName: 'Image Compare',
  }
};

describe('objToEav()', () => {
  it('should convert override object into EavItem format', () => {
    const result = EavItem.objToEav(demoObj.override, headerData);
  
    // testing attribute in EavItem 
    expect(result.Entity.Attributes).toEqual({
      DebugLog: { 
        Values: [{ value: 'Debug: Image comparison started', dimensions: null }],
        Type: 'String'  
      },
      Description: { 
        Values: [{ value: 'Compares two images and highlights differences', dimensions: null }],
        Type: 'String'  
      },
      DisplayName: { 
        Values: [{ value: 'Image Compare', dimensions: null }],
        Type: 'String'  
      },
    });
  });


});
