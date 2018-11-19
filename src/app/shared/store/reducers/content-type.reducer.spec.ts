import { contentTypeReducer, ContentTypeState } from './content-type.reducer';
import * as contentTypeActions from '../actions/content-type.actions';
import { ContentType, EavHeader } from '../../models/eav';
import { ContentTypeDef } from '../../models/eav/content-type-def';
import { AttributeDef } from '../../models/eav/attribute-def';


describe(`contentTypeReducer`, () => {

    describe(`loadSuccesAction`, () => {

        it(`should load content type on loadSuccesAction`, () => {
            const currentContentTypeState = { contentTypes: [] };
            const newContentType: ContentType = new ContentType(
                new EavHeader(1, 1754, '4f84e4ed-1d77-48a8-9f69-6eaf8eef5748', '558ed9d8-ccd0-4492-b865-61bbd297e9f8', [],
                    null, null, null, null),
                new ContentTypeDef(
                    '09ad77bb-66e8-4a1c-92ac-27253afb251d',
                    'Person',
                    '2SexyContent',
                    'description',
                    [],
                    [])
            );

            const expectedResult: ContentTypeState = { contentTypes: [newContentType] };

            const action = new contentTypeActions.LoadContentTypeSuccessAction(newContentType);
            const result = contentTypeReducer(currentContentTypeState, action);

            expect(result).toEqual(expectedResult);
        });
    });
});

