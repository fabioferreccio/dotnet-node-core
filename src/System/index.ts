import { Console as _Console } from "./Console";
import { AnsiConsole as _AnsiConsole } from "./Console/AnsiConsole";
import { Color as _Color } from "./Console/Color";
import { Rule as _Rule } from "./Console/Rule";
import { Panel as _Panel } from "./Console/Panel";
import { Table as _Table } from "./Console/Table";
import { List as _List } from "./Collections/Generic/List";
import { Enumerable as _Enumerable } from "./Linq/Enumerable";
import * as _DependencyInjection from "./DependencyInjection";
import { Exception as _Exception } from "../Domain/SeedWork/Exception";
import * as _IO from "./IO";
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
    CsBoolean,
} from "./Types";
import { Version as _Version } from "./Version";
import * as _Net from "./Net/Http";
import * as _Linq from "./Linq";
import * as _Text from "./Text";
import * as _CommandLine from "./CommandLine";

// Registry Wiring
// eslint-disable-next-line @typescript-eslint/no-explicit-any
_Enumerable.registerListFactory((source) => new _List(source as any));
_Enumerable.registerOrderedEnumerableFactory((source, context) => new _Linq.OrderedEnumerable(source, context));
_Enumerable.registerLookupFactory(() => new _Linq.Lookup());

/* eslint-disable @typescript-eslint/no-namespace */
export namespace System {
    // Types - Primitives
    export const String = CsString;
    export type String = CsString;

    export const Guid = CsGuid;
    export type Guid = CsGuid;

    export const DateTime = CsDateTime;
    export type DateTime = CsDateTime;

    export const Int32 = CsInt32;
    export type Int32 = CsInt32;

    export const Int16 = CsInt16;
    export type Int16 = CsInt16;

    export const Int64 = CsInt64;
    export type Int64 = CsInt64;

    export const Single = CsSingle;
    export type Single = CsSingle;

    export const Double = CsDouble;
    export type Double = CsDouble;

    export const Decimal = CsDecimal;
    export type Decimal = CsDecimal;

    export const Byte = CsByte;
    export type Byte = CsByte;

    export const SByte = CsSByte;
    export type SByte = CsSByte;

    export const Boolean = CsBoolean;
    export type Boolean = CsBoolean;

    // Console
    export const Console = _Console;
    export type Console = _Console;

    // Rich Console (Spectre-like) - Experimental
    /** @experimental */
    export const AnsiConsole = _AnsiConsole;
    /** @experimental */
    export type AnsiConsole = _AnsiConsole;

    /** @experimental */
    export const Color = _Color;
    /** @experimental */
    export type Color = _Color;

    /** @experimental */
    export const Rule = _Rule;
    /** @experimental */
    export type Rule = _Rule;

    /** @experimental */
    export const Panel = _Panel;
    /** @experimental */
    export type Panel = _Panel;

    /** @experimental */
    export const Table = _Table;
    /** @experimental */
    export type Table = _Table;

    // Version
    export const Version = _Version;
    export type Version = _Version;

    // Exception
    export const Exception = _Exception;
    export type Exception = _Exception;

    // Namespaces
    export namespace Collections {
        export namespace Generic {
            export const List = _List;
            export type List<T> = _List<T>;
        }
    }

    // Modules / Namespaces
    export import Linq = _Linq;
    export import DependencyInjection = _DependencyInjection;
    export import IO = _IO;
    export import Net = _Net;
    export import Text = _Text;

    /** @experimental */
    export import CommandLine = _CommandLine;
}
/* eslint-enable @typescript-eslint/no-namespace */
