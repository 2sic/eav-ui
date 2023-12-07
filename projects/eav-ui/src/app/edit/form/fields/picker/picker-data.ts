import { PickerSourceAdapter } from "./adapters/picker-source-adapter";
import { PickerStateAdapter } from "./adapters/picker-state-adapter";

export class PickerData {
  constructor(
    public state: PickerStateAdapter,
    public source: PickerSourceAdapter,
  ) { }
}