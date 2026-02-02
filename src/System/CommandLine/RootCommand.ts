import { Command } from "./Command";
import { List } from "../Collections/Generic/List";
import { CsString } from "../Types/CsString";
import { CsBoolean } from "../Types/CsBoolean";
import { CsGuid } from "../Types/CsGuid";
import { Option } from "./Option";
import { Argument } from "./Argument";

/**
 * Represents the top-level command in the command line interface.
 * @experimental This API is in preview and may change.
 */
export class RootCommand extends Command {
    public constructor(description: string | CsString = "") {
        super(
            CsGuid.NewGuid(),
            CsString.From("root"),
            typeof description === "string" ? CsString.From(description) : description,
            CsBoolean.From(false),
            new List<Option<any>>(),
            new List<Argument<any>>(),
            new List<Command>(),
        );
    }
}
