import { classLog } from '../../../../../shared/logging';
import { EditForm, ItemIdentifier, ItemIdentifierInbound } from '../models/edit-form.model';
import { UrlItemIdentifierTranslators } from './url-translate-identifiers';
import { SEPARATOR } from './url.constants';
import { UrlDataSpecs } from './url.models';

// Note: everything in here is a bit magical - and probably not ideal
// It basically prepares a very compact url representation of an EditForm
// so it can be passed in urls
// The format is not documented anywhere - so changing it will likely break things
// so be careful!
// In some cases, order matters, in others there are prefixes to identify parts

const log = classLog("UrlPrepHelper")



export function convertFormToUrl(form: EditForm) {
  const l = log.fn('convertFormToUrl', { form });
  let formUrl = '';

  const translators = UrlItemIdentifierTranslators;

  for (const item of form.items) {
    // If we already have one, the next must be separated
    if (formUrl)
      formUrl += SEPARATOR.Item;

    // Fields/Parameters can come from two places
    // When a link is inbound from the page, it will use UiFields/Parameters
    // If it's from the Admin-UI itself, it should use the newer / deeper ClientData
    const asInboundParams = item as ItemIdentifierInbound;
    const data = {
      fields: asInboundParams.UiFields ?? item.ClientData?.fields,
      parameters: asInboundParams.Parameters ?? item.ClientData?.parameters
    } satisfies UrlDataSpecs;

    for (const translator of translators) {
      if (translator.shouldEncode(item)) {
        l.a(translator.name, {item});
        formUrl += translator.toUrl(item, data);
        break;
      }
    }
  }
  return l.r(formUrl);
}


export function convertUrlToForm(formUrl: string) {
  const l = log.fn("convertUrlToForm", { formUrl });
  const itemPaths = formUrl.split(SEPARATOR.Item);

  const translators = UrlItemIdentifierTranslators;

  const items = itemPaths
    .map(path => {
      for (const translator of translators)
        if (translator.shouldDecode(path))
          return translator.fromUrl(path);
      l.a("No translator found for item path", {path});
      return null;
    })
    .filter(item => item != null) as ItemIdentifier[];
  return l.r({ items } satisfies EditForm);
}
