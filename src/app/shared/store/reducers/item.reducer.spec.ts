import { itemReducer, ItemState } from './item.reducer';
import * as itemActions from '../actions/item.actions';
import { Item, EavHeader, EavValue, EavDimensions } from '../../models/eav';
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
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), new EavAttributes(), '', [])
            );
            const expectedResult: ItemState = { items: [newItem] };

            const action = new itemActions.LoadItemSuccessAction(newItem);
            const result = itemReducer(currentItemState, action);

            expect(result).toEqual(expectedResult);
        });
    });

    describe(`updateAction`, () => {
        it(`should update item on updateAction`, () => {

            const currentEavAtribute: EavAttributes = new EavAttributes();
            currentEavAtribute['TestKey'] = {
                values: [
                    {
                        value: true,
                        dimensions: []
                    }
                ]
            };

            const currentItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), currentEavAtribute, '', [])
            );
            const currentItemState = { items: [currentItem] };
            const updatedEavAtribute: EavAttributes = new EavAttributes();

            updatedEavAtribute['TestKey'] = {
                values: [
                    {
                        value: false,
                        dimensions: []
                    }
                ]
            };

            const updatedItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), updatedEavAtribute, '', [])
            );
            const expectedResult = { items: [updatedItem] };
            const action = new itemActions.UpdateItemAction(updatedItem.entity.attributes, updatedItem.entity.id);
            const result = itemReducer(currentItemState, action);

            // we changed attribute TestKey from true to false
            expect(result.items[0].entity.attributes['TestKey'].values[0].value)
                .toEqual(expectedResult.items[0].entity.attributes['TestKey'].values[0].value);
        });
    });



    describe(`attributes actions`, () => {
        it(`should UPDATE_ITEM_ATTRIBUTE`, () => {
            const currentEavAtribute: EavAttributes = new EavAttributes();
            currentEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante',
                        dimensions: [
                            {
                                value: 'en-us'
                            }
                        ]
                    }
                ]
            };

            const currentItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), currentEavAtribute, '', [])
            );
            const currentItemState = { items: [currentItem] };
            const updatedEavAtribute: EavAttributes = new EavAttributes();
            updatedEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante Gadzo',
                        dimensions: [
                            {
                                value: 'en-us'
                            }
                        ]
                    }
                ]
            };

            const updatedItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), updatedEavAtribute, '', []
                ));
            const expectedResult = { items: [updatedItem] };

            const action = new itemActions.UpdateItemAttributeAction(updatedItem.entity.id,
                updatedItem.entity.attributes['TestKey'], 'TestKey');
            const result = itemReducer(currentItemState, action);

            // we add 'de-de' dimension
            expect(result.items[0].entity.attributes['TestKey'].values[0])
                .toEqual(expectedResult.items[0].entity.attributes['TestKey'].values[0]);
        });

        it(`should UPDATE_ITEM_ATTRIBUTE_VALUE`, () => {
            const currentEavAtribute: EavAttributes = new EavAttributes();
            currentEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante',
                        dimensions: [
                            {
                                value: 'en-us'
                            }
                        ]
                    }
                ]
            };

            const currentItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), currentEavAtribute, '', [])
            );
            const currentItemState = { items: [currentItem] };
            const updatedEavAtribute: EavAttributes = new EavAttributes();
            updatedEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante Gadzo',
                        dimensions: [
                            {
                                value: 'en-us'
                            }
                        ]
                    }
                ]
            };

            const updatedItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), updatedEavAtribute, '', []
                ));
            const expectedResult = { items: [updatedItem] };

            const action = new itemActions.UpdateItemAttributeValueAction(updatedItem.entity.id, 'TestKey',
                'Ante Gadzo', 'en-us', 'en-us', false);
            const result = itemReducer(currentItemState, action);

            // we add 'de-de' dimension
            expect(result.items[0].entity.attributes['TestKey'].values[0])
                .toEqual(expectedResult.items[0].entity.attributes['TestKey'].values[0]);
        });

        it(`should UPDATE_ITEM_ATTRIBUTE_VALUE readonly`, () => {
            const currentEavAtribute: EavAttributes = new EavAttributes();
            currentEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante',
                        dimensions: [
                            {
                                value: 'en-us'
                            }
                        ]
                    }
                ]
            };

            const currentItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), currentEavAtribute, '', [])
            );
            const currentItemState = { items: [currentItem] };
            const updatedEavAtribute: EavAttributes = new EavAttributes();
            updatedEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante Gadzo',
                        dimensions: [
                            {
                                value: '~en-us'
                            }
                        ]
                    }
                ]
            };

            const updatedItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), updatedEavAtribute, '', []
                ));
            const expectedResult = { items: [updatedItem] };

            const action = new itemActions.UpdateItemAttributeValueAction(updatedItem.entity.id, 'TestKey',
                'Ante Gadzo', 'en-us', 'en-us', true);
            const result = itemReducer(currentItemState, action);

            // we add 'de-de' dimension
            expect(result.items[0].entity.attributes['TestKey'].values[0])
                .toEqual(expectedResult.items[0].entity.attributes['TestKey'].values[0]);
        });

        it(`should UPDATE_ITEM_ATTRIBUTE_VALUE when dimension *`, () => {
            const currentEavAtribute: EavAttributes = new EavAttributes();
            currentEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante',
                        dimensions: [
                            {
                                value: '*'
                            }
                        ]
                    }
                ]
            };

            const currentItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), currentEavAtribute, '', [])
            );
            const currentItemState = { items: [currentItem] };
            const updatedEavAtribute: EavAttributes = new EavAttributes();
            updatedEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante Gadzo',
                        dimensions: [
                            {
                                value: 'en-us'
                            }
                        ]
                    }
                ]
            };

            const updatedItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), updatedEavAtribute, '', []
                ));
            const expectedResult = { items: [updatedItem] };

            const action = new itemActions.UpdateItemAttributeValueAction(updatedItem.entity.id, 'TestKey',
                'Ante Gadzo', 'en-us', 'en-us', false);
            const result = itemReducer(currentItemState, action);

            // we add 'de-de' dimension
            expect(result.items[0].entity.attributes['TestKey'].values[0])
                .toEqual(expectedResult.items[0].entity.attributes['TestKey'].values[0]);
        });

        it(`should UPDATE_ITEM_ATTRIBUTES_VALUES`, () => {
            let currentEavAtribute: EavAttributes; // = new EavAttributes();
            currentEavAtribute = {
                'TestKey': {
                    values: [
                        {
                            value: 'Ante',
                            dimensions: [
                                {
                                    value: 'en-us'
                                }
                            ]
                        }
                    ]
                },
                'TestKey2': {
                    values: [
                        {
                            value: 'Second',
                            dimensions: [
                                {
                                    value: 'en-us'
                                }
                            ]
                        }
                    ]
                }
            };

            const currentItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), currentEavAtribute, '', [])
            );
            const currentItemState = { items: [currentItem] };
            let updatedEavAtribute: EavAttributes; // = new EavAttributes();
            updatedEavAtribute = {
                'TestKey': {
                    values: [
                        {
                            value: 'Ante Gadzo',
                            dimensions: [
                                {
                                    value: 'en-us'
                                }
                            ]
                        }
                    ]
                },
                'TestKey2': {
                    values: [
                        {
                            value: 'Second Value',
                            dimensions: [
                                {
                                    value: 'en-us'
                                }
                            ]
                        }
                    ]
                }
            };

            const updatedItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), updatedEavAtribute, '', []
                ));
            const expectedResult = { items: [updatedItem] };

            const updateValues = { 'TestKey': 'Ante Gadzo', 'TestKey2': 'Second Value' };

            const action = new itemActions.UpdateItemAttributesValuesAction(updatedItem.entity.id, updateValues,
                'en-us', 'en-us');
            const result = itemReducer(currentItemState, action);
            // we add 'de-de' dimension
            expect(result.items[0].entity.attributes['TestKey'].values[0].value)
                .toEqual(expectedResult.items[0].entity.attributes['TestKey'].values[0].value);
        });

        it(`should UPDATE_ITEM_ATTRIBUTES_VALUES with dimension *`, () => {
            let currentEavAtribute: EavAttributes; // = new EavAttributes();
            currentEavAtribute = {
                'TestKey': {
                    values: [
                        {
                            value: 'Ante',
                            dimensions: [
                                {
                                    value: '*'
                                }
                            ]
                        }
                    ]
                },
                'TestKey2': {
                    values: [
                        {
                            value: 'Second',
                            dimensions: [
                                {
                                    value: '*'
                                }
                            ]
                        }
                    ]
                }
            };

            const currentItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), currentEavAtribute, '', [])
            );
            const currentItemState = { items: [currentItem] };
            let updatedEavAtribute: EavAttributes; // = new EavAttributes();
            updatedEavAtribute = {
                'TestKey': {
                    values: [
                        {
                            value: 'Ante Gadzo',
                            dimensions: [
                                {
                                    value: 'en-us'
                                }
                            ]
                        }
                    ]
                },
                'TestKey2': {
                    values: [
                        {
                            value: 'Second Value',
                            dimensions: [
                                {
                                    value: 'en-us'
                                }
                            ]
                        }
                    ]
                }
            };

            const updatedItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), updatedEavAtribute, '', []
                ));
            const expectedResult = { items: [updatedItem] };

            const updateValues = { 'TestKey': 'Ante Gadzo', 'TestKey2': 'Second Value' };

            const action = new itemActions.UpdateItemAttributesValuesAction(updatedItem.entity.id, updateValues,
                'en-us', 'en-us');
            const result = itemReducer(currentItemState, action);
            // we add 'de-de' dimension
            expect(result.items[0].entity.attributes['TestKey'].values[0].value)
                .toEqual(expectedResult.items[0].entity.attributes['TestKey'].values[0].value);
        });

        it(`should ADD_ITEM_ATTRIBUTE_VALUE`, () => {
            // let currentEavAtribute: EavAttributes; // = new EavAttributes();
            const currentEavAtribute = {
                'TestKey': {
                    values: [
                        {
                            value: 'Ante Gadzo',
                            dimensions: [
                                {
                                    value: 'en-us'
                                }
                            ]
                        }
                    ]
                },
            };

            const currentItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), currentEavAtribute, '', [])
            );
            const currentItemState = { items: [currentItem] };
            // let updatedEavAtribute: EavAttributes; // = new EavAttributes();
            const updatedEavAtribute = {
                'TestKey': {
                    values: [
                        {
                            value: 'Ante Gadzo',
                            dimensions: [
                                {
                                    value: 'en-us'
                                }
                            ]
                        },
                        {
                            value: 'Ante Gadzo de-de',
                            dimensions: [
                                {
                                    value: 'de-de'
                                }
                            ]
                        }
                    ]
                }
            };

            const updatedItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), updatedEavAtribute, '', []
                ));
            const expectedResult = { items: [updatedItem] };

            const newValue = {
                value: 'Ante Gadzo de-de',
                dimensions: [
                    {
                        value: 'de-de'
                    }
                ]
            };

            const action = new itemActions.AddItemAttributeValueAction(updatedItem.entity.id, newValue, 'TestKey');
            const result = itemReducer(currentItemState, action);
            expect(result.items[0].entity.attributes['TestKey'])
                .toEqual(expectedResult.items[0].entity.attributes['TestKey']);
        });

        it(`should SAVE_ITEM_ATTRIBUTES_VALUES`, () => {
            // let currentEavAtribute: EavAttributes; // = new EavAttributes();
            const currentEavAtribute = {
                'TestKey': {
                    values: [
                        {
                            value: 'Ante Gadzo',
                            dimensions: [
                                {
                                    value: 'en-us'
                                }
                            ]
                        }
                    ]
                },
                'TestKey2': {
                    values: [
                        {
                            value: 'Ante Gadzo',
                            dimensions: [
                                {
                                    value: 'en-us'
                                }
                            ]
                        }
                    ]
                }
            };

            const currentItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), currentEavAtribute, '', [])
            );
            const currentItemState = { items: [currentItem] };
            // let updatedEavAtribute: EavAttributes; // = new EavAttributes();
            const updatedEavAtribute = {
                'TestKey': {
                    values: [
                        {
                            value: 'change 1',
                            dimensions: [
                                {
                                    value: 'en-us'
                                }
                            ]
                        }
                    ]
                },
                'TestKey2': {
                    values: [
                        {
                            value: 'change 2',
                            dimensions: [
                                {
                                    value: 'en-us'
                                }
                            ]
                        }
                    ]
                }
            };

            const updatedItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), updatedEavAtribute, '', []
                ));
            const expectedResult = { items: [updatedItem] };

            const updateValues = { 'TestKey': 'change 1', 'TestKey2': 'change 2' };

            const action = new itemActions.SaveItemAttributesValuesAction(updatedItem.entity.id, updatedItem,
                updateValues, 'en-us', 'en-us');
            const result = itemReducer(currentItemState, action);

            expect(result.items[0].entity.attributes['TestKey'])
                .toEqual(expectedResult.items[0].entity.attributes['TestKey']);
        });

    });

    describe(`dimensions actions`, () => {
        it(`should add item attribute dimension`, () => {

            const currentEavAtribute: EavAttributes = new EavAttributes();
            currentEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante',
                        dimensions: [
                            {
                                value: 'en-us'
                            }
                        ]
                    }
                ]
            };

            const currentItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), currentEavAtribute, '', [])
            );
            const currentItemState = { items: [currentItem] };
            const updatedEavAtribute: EavAttributes = new EavAttributes();
            updatedEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante',
                        dimensions: [
                            {
                                value: 'en-us'
                            },
                            {
                                value: 'de-de'
                            }
                        ]
                    }
                ]
            };

            const updatedItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), updatedEavAtribute, '', []
                ));
            const expectedResult = { items: [updatedItem] };

            const action = new itemActions.AddItemAttributeDimensionAction(currentItem.entity.id, 'TestKey',
                'de-de', 'en-us', 'en-us', false);
            const result = itemReducer(currentItemState, action);

            // we add 'de-de' dimension
            expect(result.items[0].entity.attributes['TestKey'].values[0])
                .toEqual(expectedResult.items[0].entity.attributes['TestKey'].values[0]);
        });

        it(`should add item attribute dimension readonly`, () => {

            const currentEavAtribute: EavAttributes = new EavAttributes();
            currentEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante',
                        dimensions: [
                            {
                                value: 'en-us'
                            }
                        ]
                    }
                ]
            };

            const currentItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), currentEavAtribute, '', [])
            );
            const currentItemState = { items: [currentItem] };
            const updatedEavAtribute: EavAttributes = new EavAttributes();
            updatedEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante',
                        dimensions: [
                            {
                                value: 'en-us'
                            },
                            {
                                value: '~de-de'
                            }
                        ]
                    }
                ]
            };

            const updatedItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), updatedEavAtribute, '', []
                ));
            const expectedResult = { items: [updatedItem] };

            const action = new itemActions.AddItemAttributeDimensionAction(currentItem.entity.id, 'TestKey',
                'de-de', 'en-us', 'en-us', true);
            const result = itemReducer(currentItemState, action);

            // we add 'de-de' dimension
            expect(result.items[0].entity.attributes['TestKey'].values[0])
                .toEqual(expectedResult.items[0].entity.attributes['TestKey'].values[0]);
        });

        it(`should add item attribute dimension when dimension *`, () => {

            const currentEavAtribute: EavAttributes = new EavAttributes();
            currentEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante',
                        dimensions: [
                            {
                                value: '*'
                            }
                        ]
                    }
                ]
            };

            const currentItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), currentEavAtribute, '', [])
            );
            const currentItemState = { items: [currentItem] };
            const updatedEavAtribute: EavAttributes = new EavAttributes();
            updatedEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante',
                        dimensions: [
                            {
                                value: '*'
                            },
                            {
                                value: 'de-de'
                            }
                        ]
                    }
                ]
            };

            const updatedItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), updatedEavAtribute, '', []
                ));
            const expectedResult = { items: [updatedItem] };

            const action = new itemActions.AddItemAttributeDimensionAction(currentItem.entity.id, 'TestKey',
                'de-de', 'en-us', 'en-us', false);
            const result = itemReducer(currentItemState, action);

            // we add 'de-de' dimension
            expect(result.items[0].entity.attributes['TestKey'].values[0])
                .toEqual(expectedResult.items[0].entity.attributes['TestKey'].values[0]);
        });

        it(`should remove item attribute dimension only dimension`, () => {

            const currentEavAtribute: EavAttributes = new EavAttributes();
            currentEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante',
                        dimensions: [
                            {
                                value: 'en-us'
                            },
                            {
                                value: 'de-de'
                            }
                        ]
                    }
                ]
            };

            const currentItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), currentEavAtribute, '', [])
            );
            const currentItemState = { items: [currentItem] };
            const updatedEavAtribute: EavAttributes = new EavAttributes();
            updatedEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante',
                        dimensions: [
                            {
                                value: 'en-us'
                            }
                        ]
                    }
                ]
            };

            const updatedItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), updatedEavAtribute, '', []
                ));
            const expectedResult = { items: [updatedItem] };
            const action = new itemActions.RemoveItemAttributeDimensionAction(currentItem.entity.id, 'TestKey', 'de-de');
            const result = itemReducer(currentItemState, action);

            // we add 'de-de' dimension
            expect(result.items[0].entity.attributes['TestKey'].values[0])
                .toEqual(expectedResult.items[0].entity.attributes['TestKey'].values[0]);
        });

        it(`should remove item attribute dimension and value`, () => {

            const currentEavAtribute: EavAttributes = new EavAttributes();
            currentEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante',
                        dimensions: [
                            {
                                value: 'en-us'
                            }
                        ]
                    },
                    {
                        value: 'Ante De',
                        dimensions: [
                            {
                                value: 'de-de'
                            }
                        ]
                    }
                ]
            };

            const currentItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), currentEavAtribute, '', [])
            );
            const currentItemState = { items: [currentItem] };
            const updatedEavAtribute: EavAttributes = new EavAttributes();
            updatedEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante',
                        dimensions: [
                            {
                                value: 'en-us'
                            }
                        ]
                    }
                ]
            };

            const updatedItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), updatedEavAtribute, '', []
                ));
            const expectedResult = { items: [updatedItem] };
            const action = new itemActions.RemoveItemAttributeDimensionAction(currentItem.entity.id, 'TestKey', 'de-de');
            const result = itemReducer(currentItemState, action);

            // we add 'de-de' dimension
            expect(result.items[0].entity.attributes['TestKey'].values[0])
                .toEqual(expectedResult.items[0].entity.attributes['TestKey'].values[0]);
        });

        it(`should remove item attribute dimension and value readonly`, () => {

            const currentEavAtribute: EavAttributes = new EavAttributes();
            currentEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante',
                        dimensions: [
                            {
                                value: 'en-us'
                            }
                        ]
                    },
                    {
                        value: 'Ante De',
                        dimensions: [
                            {
                                value: '~de-de'
                            }
                        ]
                    }
                ]
            };

            const currentItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), currentEavAtribute, '', [])
            );
            const currentItemState = { items: [currentItem] };
            const updatedEavAtribute: EavAttributes = new EavAttributes();
            updatedEavAtribute['TestKey'] = {
                values: [
                    {
                        value: 'Ante',
                        dimensions: [
                            {
                                value: 'en-us'
                            }
                        ]
                    }
                ]
            };

            const updatedItem: Item = new Item(
                new EavHeader(1, 1, '', '', [], null, null, null, null),
                new EavEntity(1, 1, '', new EavType('', ''), updatedEavAtribute, '', []
                ));
            const expectedResult = { items: [updatedItem] };
            const action = new itemActions.RemoveItemAttributeDimensionAction(currentItem.entity.id, 'TestKey', 'de-de');
            const result = itemReducer(currentItemState, action);

            // we add 'de-de' dimension
            expect(result.items[0].entity.attributes['TestKey'].values[0])
                .toEqual(expectedResult.items[0].entity.attributes['TestKey'].values[0]);
        });
    });

});
