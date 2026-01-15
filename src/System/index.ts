import { Console } from "./Console";
import { List } from "./Collections/Generic/List";
import { Enumerable } from "./Linq/Enumerable";
import * as DependencyInjection from "./DependencyInjection";
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
    CsSByte,
} from "../Domain/ValueObjects";

import * as Linq from "./Linq"; // Statically imported namespace

// Registry Wiring
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Enumerable.registerListFactory((source) => new List(source as any));
Enumerable.registerOrderedEnumerableFactory((source, context) => new Linq.OrderedEnumerable(source, context));
Enumerable.registerLookupFactory(() => new Linq.Lookup());

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
            List: List,
        },
    },
    Linq: Linq,
    DependencyInjection: DependencyInjection,
};

export { DependencyInjection };
