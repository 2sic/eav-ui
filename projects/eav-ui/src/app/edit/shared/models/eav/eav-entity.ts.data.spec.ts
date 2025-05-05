import { EavEntityDto } from '../json-format-v1';
import { EavEntity } from './eav-entity';
import { testTypeSandwich } from './eav-type.ts.data.spec';

export const testEntityHeaderOnlyDto: EavEntityDto = {
  Attributes: {},
  Guid: 'd2f1f1e9-d747-4594-9a50-3e937af595e6',
  Id: 42,
  Owner: 'nobody',
  Type: testTypeSandwich,
  Version: 1,
};

export const testEntityHeaderOnlyInternal: EavEntity = {
  Attributes: {},
  Guid: 'd2f1f1e9-d747-4594-9a50-3e937af595e6',
  Id: 42,
  Owner: 'nobody',
  Type: testTypeSandwich,
  Version: 1,
  For: null,
  Metadata: null,
};

export const testEntityHeaderOnly2Dto: EavEntityDto = {
  Attributes: {},
  Guid: 'e632ca07-dacc-4ba7-9dcb-cf6219e3d2b0',
  Id: 47,
  Owner: 'hans',
  Type: testTypeSandwich,
  Version: 3,
};

export const testEntityHeaderOnly2Internal: EavEntity = {
  Attributes: {},
  Guid: 'e632ca07-dacc-4ba7-9dcb-cf6219e3d2b0',
  Id: 47,
  Owner: 'hans',
  Type: testTypeSandwich,
  Version: 3,
  For: null,
  Metadata: null,
};