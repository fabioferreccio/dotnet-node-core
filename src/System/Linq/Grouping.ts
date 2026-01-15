import { IGrouping } from "../../Domain/Interfaces/IGrouping";
import { Enumerable } from "./Enumerable";

export class Grouping<TKey, TElement> extends Enumerable<TElement> implements IGrouping<TKey, TElement> {
    private readonly _key: TKey;

    constructor(key: TKey, elements: TElement[]) {
        super(elements);
        this._key = key;
    }

    public get Key(): TKey {
        return this._key;
    }
}
