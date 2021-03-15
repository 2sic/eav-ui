import { Dictionary } from '../shared/models/dictionary.model';
import { CompareWith } from './models/compare-with.model';
import { HistoryAttribute, HistoryAttributeValue, HistoryItem } from './models/history-item.model';
import { Version, VersionEntityAttributeValues, VersionJsonParsed } from './models/version.model';

export function getHistoryItems(versions: Version[], page: number, pageSize: number, compareWith: CompareWith) {
  if (versions == null || page == null || pageSize == null || compareWith == null) { return null; }
  const filtered = versions.slice((page - 1) * pageSize, page * pageSize);

  const historyItems = calcHistoryItems(filtered, versions, compareWith);
  return historyItems;
}

function calcHistoryItems(filteredVersions: Version[], versions: Version[], compareWith: CompareWith) {
  return filteredVersions.map(version => {
    const historyItem: HistoryItem = {
      changeSetId: version.ChangeSetId,
      attributes: calcHistoryAttributes(version, versions, compareWith),
      historyId: version.HistoryId,
      timeStamp: version.TimeStamp,
      user: version.User,
      versionNumber: version.VersionNumber,
      isLastVersion: !versions.some(v => v.VersionNumber === version.VersionNumber + 1),
    };
    return historyItem;
  });
}

function calcHistoryAttributes(version: Version, versions: Version[], compareWith: CompareWith) {
  const currentDataTypes = (JSON.parse(version.Json) as VersionJsonParsed).Entity.Attributes;
  const previousItem = compareWith === 'live' ? findLive(versions) : versions.find(v => v.VersionNumber === version.VersionNumber - 1);
  const previousDataTypes = previousItem ? (JSON.parse(previousItem.Json) as VersionJsonParsed).Entity.Attributes : null;

  const allAttributes: { name: string, dataType: string }[] = [];
  if (currentDataTypes != null) {
    Object.entries(currentDataTypes).forEach(([dataType, attributes]) => {
      Object.keys(attributes).forEach(attributeName => {
        if (allAttributes.find(a => a.name === attributeName && a.dataType === dataType) != null) { return; }
        allAttributes.push({ name: attributeName, dataType });
      });
    });
  }
  if (previousDataTypes != null) {
    Object.entries(previousDataTypes).forEach(([dataType, attributes]) => {
      Object.keys(attributes).forEach(attributeName => {
        if (allAttributes.find(a => a.name === attributeName && a.dataType === dataType) != null) { return; }
        allAttributes.push({ name: attributeName, dataType });
      });
    });
  }

  const historyAttributes = allAttributes.map(attribute => {
    const currentValues = currentDataTypes?.[attribute.dataType]?.[attribute.name];
    const previousValues = previousDataTypes?.[attribute.dataType]?.[attribute.name];

    const historyAttribute: HistoryAttribute = {
      name: attribute.name,
      dataType: attribute.dataType,
      change: calcChangeType(currentValues, previousValues, true),
      values: calcHistoryValues(currentValues, previousValues),
    };
    return historyAttribute;
  });

  return historyAttributes;
}

function findLive(versions: Version[]) {
  let liveVersion = versions[0];
  for (const version of versions) {
    if (version.VersionNumber <= liveVersion.VersionNumber) { continue; }
    liveVersion = version;
  }
  return liveVersion;
}

function calcHistoryValues(values: VersionEntityAttributeValues, previousValues: VersionEntityAttributeValues) {
  const allLangKeys: string[] = [];
  if (values != null) {
    Object.keys(values).forEach(lang => {
      if (allLangKeys.includes(lang)) { return; }
      allLangKeys.push(lang);
    });
  }
  if (previousValues != null) {
    Object.keys(previousValues).forEach(lang => {
      if (allLangKeys.includes(lang)) { return; }
      allLangKeys.push(lang);
    });
  }

  const historyValues = allLangKeys.map(langKey => {
    const currentValue = values?.[langKey];
    const previousValue = previousValues?.[langKey];

    const historyValue: HistoryAttributeValue = {
      langKey,
      value: currentValue,
      oldValue: previousValue,
      change: calcChangeType(currentValue, previousValue),
    };
    return historyValue;
  });

  return historyValues;
}

function calcChangeType(currentValue: any, previousValue: any, sortObjectKeys = false) {
  let change: 'new' | 'deleted' | 'changed' | 'none';

  if (sortObjectKeys) {
    if (typeof currentValue === 'object') {
      currentValue = sortKeysAlphabetically(currentValue);
    }
    if (typeof previousValue === 'object') {
      previousValue = sortKeysAlphabetically(previousValue);
    }
  }

  if (currentValue != null && previousValue != null) {
    if (JSON.stringify(currentValue) !== JSON.stringify(previousValue)) {
      change = 'changed';
    } else {
      change = 'none';
    }
  } else if (currentValue != null) {
    change = 'new';
  } else {
    change = 'deleted';
  }

  return change;
}

function sortKeysAlphabetically(obj: Dictionary<any>): Dictionary<any> {
  if (typeof obj !== 'object') { return obj; }

  return Object.keys(obj).sort().reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});
}
