import { HistoryAttribute, HistoryAttributeValue, HistoryItem } from './models/history-item.model';
import { Version, VersionJsonParsed } from './models/version.model';

export function getHistoryItems(versions: Version[], page: number, pageSize: number) {
  if (versions == null || page == null || pageSize == null) { return null; }
  const filtered = versions?.slice((page - 1) * pageSize, page * pageSize);

  const historyItems = filtered.map(version => {
    const previous = versions.find(v => v.VersionNumber === version.VersionNumber - 1);
    const previousJson: VersionJsonParsed = previous ? JSON.parse(previous.Json) : null;
    const isLastVersion = !versions.some(v => v.VersionNumber === version.VersionNumber + 1);
    const json: VersionJsonParsed = JSON.parse(version.Json);

    const allHistoryAttributes: HistoryAttribute[] = [];
    Object.entries(json.Entity.Attributes).forEach(([dataType, attributes]) => {
      const historyAttributes = Object.entries(attributes).map(([attributeName, attributeValues]) => {
        const historyAttributeValues = Object.entries(attributeValues).map(([langKey, value]) => {
          const historyAttributeValue: HistoryAttributeValue = {
            langKey,
            value,
            hasChanged: JSON.stringify(value) !== JSON.stringify(previousJson?.Entity.Attributes[dataType]?.[attributeName]?.[langKey]),
          };
          return historyAttributeValue;
        });

        const historyAttribute: HistoryAttribute = {
          attributeName,
          dataType,
          expand: false,
          hasChanged: JSON.stringify(attributeValues) !== JSON.stringify(previousJson?.Entity.Attributes[dataType]?.[attributeName]),
          attributeValues: historyAttributeValues,
        };
        return historyAttribute;
      });
      allHistoryAttributes.push(...historyAttributes);
    });

    const historyItem: HistoryItem = {
      changeSetId: version.ChangeSetId,
      attributes: allHistoryAttributes,
      historyId: version.HistoryId,
      timeStamp: version.TimeStamp,
      user: version.User,
      versionNumber: version.VersionNumber,
      isLastVersion,
    };
    return historyItem;
  });

  return historyItems;
}
