import { FieldSettings } from 'projects/edit-types/src/FieldSettings';
import { RxHelpers } from '../../../../../shared/rxJs/rx.helpers';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;

/**
 * Helper class for data source, to figure out all the fields we need to retrieve from the server.
 */
export class DataSourceMoreFieldsHelper extends ServiceBase {
  constructor(enableLog = logThis) {
    super(new EavLogger('DataSourceMoreFieldsHelper', enableLog));
  }

  fieldListToRetrieveFromServer(settings: FieldSettings): string {
    this.log.a('fieldListToRetrieveFromServer', [settings]);

    const treeConfig = settings.PickerTreeConfiguration;
    const moreFields = settings.MoreFields?.split(',') ?? [];
    const queryFields = [settings.Value, settings.Label];
    const treeFields = [
      treeConfig?.TreeChildIdField,
      treeConfig?.TreeParentIdField,
      treeConfig?.TreeChildParentRefField,
      treeConfig?.TreeParentChildRefField,
    ];
    const combinedFields = [...['Title', 'Id', 'Guid'], ...moreFields, ...queryFields, ...treeFields]
      // extraction should happen in every field
      .map(field => this.extractFieldNamesFromTokens(field, true)).flat();

    const stringFields = [settings.ItemTooltip, settings.ItemInformation, settings.ItemLink]
      .map(field => this.extractFieldNamesFromTokens(field, false)).flat();

    // in the end, we should deduplicate the fields
    const allFields = [...combinedFields, ...stringFields]
      .filter(RxHelpers.distinct);

    // merging into one long string
    return allFields.join(',');
  }


  /**
   * Parse a string to find out the field names in [Item:FieldName] format
   * 
   * @param input input string
   * @param enableSimpleFields enable simple fields
   * @returns parsed fields
   */
  extractFieldNamesFromTokens(input: string, enableSimpleFields: boolean = true): string[] {
    this.log.a('extractFieldNamesFromTokens', [input, enableSimpleFields]);
    const fields: string[] = [];

    // 1.) skip processing on null or empty
    if (!(input?.trim().length > 0)) return fields;
  
    // 2.) some input parts could have a string such as "[Item:Color] - [Item:Title]"
    // these should be extracted, so then we have "Color" and "Title"
    const regex = /\[Item:(\S.*?)\]/gi;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(input)) !== null) {
      const trimmedMatch = match[1].trim();
      if (trimmedMatch) fields.push(trimmedMatch);
    }

    // 3.) optionaly, when input parts is simple field name, like "Color" - these should be used 1:1
    // so nothing to do, just return input
    if (enableSimpleFields && fields.length === 0) fields.push(input);   
  
    return fields;
  }

}