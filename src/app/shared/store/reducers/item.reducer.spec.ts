import { itemReducer, ItemState } from './item.reducer';
import * as itemActions from '../actions/item.actions';
import { Item, EavHeader } from '../../models/eav';
import { EavEntity } from '../../models/eav/eav-entity';
import { EavType } from '../../models/eav/eav-type';
import { EavAttributes } from '../../models/eav/eav-attributes';
import { EavValues } from '../../models/eav/eav-values';
import { Value1 } from '../../models/json-format-v1/value1';


describe(`itemReducer`, () => {

    describe(`loadSuccesAction`, () => {

        it(`should load item on loadSuccesAction`, () => {
            const currentItemState = { items: [] };
            const newItem: Item = new Item(
                new EavHeader(1, 42900, 'e8a702d2-eccd-4b0f-83bd-600d8a8449d9', 'DataPipeline', [],
                    null, null, null, null),
                new EavEntity(42900,
                    6,
                    'e8a702d2-eccd-4b0f-83bd-600d8a8449d9',
                    new EavType('DataPipeline', 'DataPipeline'),
                    new EavAttributes(),
                    'dnn:userid=1',
                    []
                ));
            const expectedResult: ItemState = { items: [newItem] };

            const action = new itemActions.LoadItemSuccessAction(newItem);
            const result = itemReducer(currentItemState, action);

            expect(result).toEqual(expectedResult);
        });
    });

    describe(`updateAction`, () => {
        it(`should update item on updateAction`, () => {
            const currentValue1: any = new Value1();
            currentValue1['BooleanDefault'] = true;
            const currentEavAtribute: EavAttributes = new EavAttributes();
            currentEavAtribute['BooleanDefault'] = EavValues.create<boolean>(currentValue1);
            const currentItem: Item = new Item(
                new EavHeader(1, 42900, 'e8a702d2-eccd-4b0f-83bd-600d8a8449d9', 'DataPipeline', [],
                    null, null, null, null),
                new EavEntity(42900,
                    6,
                    'e8a702d2-eccd-4b0f-83bd-600d8a8449d9',
                    new EavType('DataPipeline', 'DataPipeline'),
                    currentEavAtribute,
                    'dnn:userid=1',
                    []
                ));
            const currentItemState = { items: [currentItem] };

            const updatedValue1: any = new Value1();
            updatedValue1['BooleanDefault'] = false;
            const updatedEavAtribute: EavAttributes = new EavAttributes();
            updatedEavAtribute['BooleanDefault'] = EavValues.create<boolean>(updatedValue1);
            const updatedItem: Item = new Item(
                new EavHeader(1, 42900, 'e8a702d2-eccd-4b0f-83bd-600d8a8449d9', 'DataPipeline', [],
                    null, null, null, null),
                new EavEntity(42900,
                    6,
                    'e8a702d2-eccd-4b0f-83bd-600d8a8449d9',
                    new EavType('DataPipeline', 'DataPipeline'),
                    updatedEavAtribute,
                    'dnn:userid=1',
                    []
                ));
            const expectedResult = { items: [updatedItem] };

            const action = new itemActions.UpdateItemAction(updatedItem.entity.attributes, updatedItem.entity.id);
            const result = itemReducer(currentItemState, action);
            // we changed attribute booleanDefault from true to false
            expect(result.items[0].entity.attributes['BooleanDefault'].values[0].value)
                .toEqual(expectedResult.items[0].entity.attributes['BooleanDefault'].values[0].value);
        });
    });
});
