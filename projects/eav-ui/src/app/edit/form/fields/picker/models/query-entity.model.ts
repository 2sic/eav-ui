// 2024-04-29 2dm removed this #cleanup-picker
// import { EntityForPicker } from 'projects/edit-types';

// export interface QueryEntity extends EntityForPicker {
//   Guid: string;
//   // 2024-04-26 2dm removed this, don't think it's used and believe it's a leftover #cleanup-picker
//   // Modified: string;

//   // 2024-04-29 2dm removed this #cleanup-picker
//   // [key: string]: any;
// }


// todo
// - get rid of the [key: string]: any; - should always be in the data to clearly separate the internal props from the raw data
// - move the Guid to the PickerItem, or create a PickerItemEntity or something...
// - drop the EntityForPicker and use the PickerItem everywhere