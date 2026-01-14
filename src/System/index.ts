import { Console } from './Console';
import { List } from './Collections/Generic/List';
import { CsDateTime, CsGuid, CsInt32, CsString } from '../Domain/ValueObjects';

export const System = {
    String: CsString,
    Guid: CsGuid,
    DateTime: CsDateTime,
    Int32: CsInt32,
    Console: Console,
    Collections: {
        Generic: {
            List: List
        }
    }
};
