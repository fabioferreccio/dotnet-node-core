import { IEnumerable } from "../../Domain/Interfaces/IEnumerable";
import { IGrouping } from "../../Domain/Interfaces/IGrouping";
import { isEquatable } from "../../Domain/Interfaces/IEquatable";
import { Enumerable } from "./Enumerable";
import { Grouping } from "./Grouping";

export class Lookup<TKey, TElement>
    extends Enumerable<IGrouping<TKey, TElement>>
    implements IEnumerable<IGrouping<TKey, TElement>>
{
    private _groupings: Grouping<TKey, TElement>[] = [];

    constructor() {
        const groupings: Grouping<TKey, TElement>[] = [];
        super(groupings);
        this._groupings = groupings;
    }

    public Add(key: TKey, element: TElement): void {
        const group = this._findGroup(key);
        if (group) {
            // Grouping extends Enumerable. _source is protected.
            // Accessing protected member of another instance of the same class inheritance hierarchy is allowed in TS,
            // but here 'group' is Grouping<TKey, TElement>.
            // We cast to any to access _source as it's defined in Enumerable.
            // In C# this works for same-class access, in TS protected is less strict but safe here.
            ((group as any)["_source"] as TElement[]).push(element);
        } else {
            this._groupings.push(new Grouping(key, [element]));
        }
    }

    private _findGroup(key: TKey): Grouping<TKey, TElement> | undefined {
        if (isEquatable(key)) {
            return this._groupings.find((g) => {
                if (isEquatable(g.Key)) {
                    return g.Key.Equals(key);
                }
                return g.Key === key;
            });
        }
        return this._groupings.find((g) => g.Key === key);
    }
}
