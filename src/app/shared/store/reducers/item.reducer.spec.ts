import { itemReducer } from './item.reducer';
import * as itemActions from '../actions/item.actions';
import { Item, EavHeader } from '../../models/eav';
import { EavEntity } from '../../models/eav/eav-entity';
import { EavType } from '../../models/eav/eav-type';
import { EavAttributes } from '../../models/eav/eav-attributes';

describe(`itemReducer`, () => {

    describe(`loadSuccesAction`, () => {

        it(`should load item on loadSuccesAction`, () => {
            const currentItemState = [];
            const newItem: Item = new Item(
                new EavHeader(1),
                new EavEntity(42900,
                    6,
                    'e8a702d2-eccd-4b0f-83bd-600d8a8449d9',
                    new EavType('DataPipeline', 'DataPipeline'),
                    new EavAttributes(),
                    'dnn:userid=1',
                    []
                ));
            const expectedResult: Item[] = [newItem];

            const action = new itemActions.LoadItemsSuccessAction(newItem);
            const result = itemReducer(currentItemState, action);

            expect(result).toEqual(expectedResult);
        });
    });
});
