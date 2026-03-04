import { classLog } from '../../../../../shared/logging';
import { ItemIdentifier } from '../../shared/models/edit-form.model';
import { EavEntityBundleDto } from '../shared/models/json-format-v1';

const logSpecs = {
  all: false,
  mergeResponse: true,
};

/**
 * This helps to make items data smaller (for retrieving data),
 * and then rejoin the returned data with the parts which were not sent.
 * 
 * Note that as of 2026-01-08 it's not in use any more, but may be useful later.
 * It was previously created to transport js-only objects to the edit ui to bypass the url.
 * But now it is in the url, so it's not relevant any more.
 */
export class ItemsRequestRestoreHelper {

  log = classLog({ ItemsRequestRestoreHelper }, logSpecs );

  constructor(items: ItemIdentifier[], private contentsOverride?: Record<string, unknown>[]) {
    // Add ClientId index number to request,
    // so it can be matched again when the response comes back
    this.itemsWithIndex = items.map((item, index) => ({
      ...item,
      clientId: index,
    }));
  }

  private itemsWithIndex: (ItemIdentifier & { clientId: number })[];

  itemsForRequest() {
    const cleaned = this.itemsWithIndex.map((item) => {
      // Drop properties which are not needed for the request
      const { Prefill, ClientData, ...cleaned } = item;
      return cleaned;
    });
    return cleaned;
  }

  mergeResponse(result: EavEntityBundleDto[]): EavEntityBundleDto[] {
    const l = this.log.fnIf('mergeResponse', { result, itemsWithIndex: this.itemsWithIndex });
    // Merge the response with the original items
    const merged = result.map(item => {
      // try to find original item
      const original = this.itemsWithIndex.find(i => i.clientId === item.Header.clientId);
      l.a('fetchFormData - remix', { item, original });

      return {
        ...item,
        Header: {
          ...item.Header,
          Prefill: original?.Prefill,
          ClientData: {
            ...original?.ClientData,
          },
        },
      } satisfies EavEntityBundleDto;
    });
    return l.r(merged);
  }
}