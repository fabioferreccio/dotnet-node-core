import { Console } from './Console';
import { List } from './Collections/Generic/List';
import { Enumerable } from './Linq/Enumerable';
import { 
    CsDateTime, 
    CsGuid, 
    CsInt32, 
    CsString, 
    CsInt16, 
    CsInt64, 
    CsSingle, 
    CsDouble, 
    CsDecimal,
    CsByte,
    CsSByte
} from '../Domain/ValueObjects';

export const System = {
    String: CsString,
    Guid: CsGuid,
    DateTime: CsDateTime,
    Int32: CsInt32,
    Int16: CsInt16,
    Int64: CsInt64,
    Single: CsSingle,
    Double: CsDouble,
    Decimal: CsDecimal,
    Byte: CsByte,
    SByte: CsSByte,
    Console: Console,
    Collections: {
        Generic: {
            List: List
        }
    },
    Linq: {
        Enumerable: Enumerable
    }
};
