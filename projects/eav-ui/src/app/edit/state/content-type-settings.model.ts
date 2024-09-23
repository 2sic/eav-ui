export interface ContentTypeSettings {
  Description: string;
  EditInstructions: string;
  /**
   * Content-Type Features.
   * The are multi-line with "=" as separator.
   * TODO: not quite sure what settings etc, should be documented more.
   */
  Features: string;

  Label: string;
  ListInstructions: string;
  Notes: string;
  Icon: string;
  Link: string;
  _itemTitle: string;
  _slotCanBeEmpty: boolean;
  _slotIsEmpty: boolean;
}
