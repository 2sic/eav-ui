import { DataSourceEntity } from './data-sources/data-source-entity';
import { DataSourceString } from './data-sources/data-source-string';
import { DataSourceQuery } from './data-sources/data-source-query';
import { DataAdapterString } from './adapters/data-adapter-string';
import { DataAdapterEntity } from './adapters/data-adapter-entity';
import { DataAdapterQuery } from './adapters/data-adapter-query';
import { DataSourceEmpty } from './data-sources/data-source-empty';
import { StateAdapter } from './adapters/state-adapter';
import { StateAdapterEntity } from './adapters/state-adapter-entity';
import { StateAdapterString } from './adapters/state-adapter-string';

/**
 * These providers must be added to all the picker controls.
 * This is important, so that they get a new instance of the services.
 * Otherwise the end up sharing the same instance of the service.
 * ...and when opened the second time, they will show an empty dropdown.
 */

export const PickerProviders = [
  DataSourceString,
  DataSourceEntity,
  DataSourceQuery,
  DataSourceEmpty,

  DataAdapterString,
  DataAdapterEntity,
  DataAdapterQuery,

  StateAdapter,
  StateAdapterString,
  StateAdapterEntity,
];
