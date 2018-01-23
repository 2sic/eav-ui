import { contentTypeReducer } from './content-type.reducer';
import * as contentTypeActions from '../actions/content-type.actions';
import { ContentType, EavHeader } from '../../models/eav';
import { ContentTypeDef } from '../../models/eav/content-type-def';
import { AttributeDef } from '../../models/eav/attribute-def';


describe(`contentTypeReducer`, () => {

    describe(`loadSuccesAction`, () => {

        it(`should load content type on loadSuccesAction`, () => {
            const currentContentTypeState = [];
            const newContentType: ContentType = new ContentType(
                new EavHeader(1),
                new ContentTypeDef(
                    '09ad77bb-66e8-4a1c-92ac-27253afb251d',
                    'Person',
                    '2SexyContent',
                    'description',
                    [],
                    [])
            );

            const expectedResult: ContentType[] = [newContentType];

            const action = new contentTypeActions.LoadContentTypeSuccessAction(newContentType);
            const result = contentTypeReducer(currentContentTypeState, action);

            expect(result).toEqual(expectedResult);
        });
    });
});

