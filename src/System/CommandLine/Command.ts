import { Symbol } from "./Symbol";
import { Option } from "./Option";
import { Argument } from "./Argument";
import { List } from "../Collections/Generic/List";
import { CsString } from "../Types/CsString";
import { CsBoolean } from "../Types/CsBoolean";
import { CsGuid } from "../Types/CsGuid";
import { InvocationContext } from "./InvocationContext";

/**
 * Represents a command handler delegate.
 */
export type CommandHandler = (context: InvocationContext) => void | Promise<void>;

/**
 * Represents a command or an action that can be performed in the command line interface.
 * @experimental This API is in preview and may change.
 */
export class Command extends Symbol {
    private readonly _options: List<Option<any>>;
    private readonly _arguments: List<Argument<any>>;
    private readonly _subcommands: List<Command>;
    private readonly _handler?: CommandHandler;

    protected constructor(
        id: CsGuid,
        name: CsString,
        description: CsString,
        isHidden: CsBoolean,
        options: List<Option<any>>,
        arguments_: List<Argument<any>>,
        subcommands: List<Command>,
        handler?: CommandHandler,
    ) {
        super(id, name, description, isHidden);
        this._options = options;
        this._arguments = arguments_;
        this._subcommands = subcommands;
        this._handler = handler;
        Object.freeze(this);
    }

    /**
     * Creates a new command.
     */
    public static From(name: string | CsString, description: string | CsString = ""): Command {
        const nameVal = typeof name === "string" ? CsString.From(name) : name;
        const descVal = typeof description === "string" ? CsString.From(description) : description;
        return new Command(
            CsGuid.NewGuid(),
            nameVal,
            descVal,
            CsBoolean.From(false),
            new List<Option<any>>(),
            new List<Argument<any>>(),
            new List<Command>(),
        );
    }

    /**
     * Gets the options for the command.
     */
    public get Options(): List<Option<any>> {
        return this._options;
    }

    /**
     * Gets the arguments for the command.
     */
    public get Arguments(): List<Argument<any>> {
        return this._arguments;
    }

    /**
     * Gets the subcommands for the command.
     */
    public get Subcommands(): List<Command> {
        return this._subcommands;
    }

    /**
     * Gets the handler for the command.
     */
    public get Handler(): CommandHandler | undefined {
        return this._handler;
    }

    /**
     * Adds an option to the command and returns a new instance.
     */
    public AddOption(option: Option<any>): Command {
        const newOptions = new List<Option<any>>(this._options.ToArray());
        newOptions.Add(option);
        return new Command(
            this._id,
            this._name,
            this._description,
            this._isHidden,
            newOptions,
            this._arguments,
            this._subcommands,
            this._handler,
        );
    }

    /**
     * Adds an argument to the command and returns a new instance.
     */
    public AddArgument(argument: Argument<any>): Command {
        const newArguments = new List<Argument<any>>(this._arguments.ToArray());
        newArguments.Add(argument);
        return new Command(
            this._id,
            this._name,
            this._description,
            this._isHidden,
            this._options,
            newArguments,
            this._subcommands,
            this._handler,
        );
    }

    /**
     * Adds a subcommand to the command and returns a new instance.
     */
    public AddCommand(command: Command): Command {
        const newSubcommands = new List<Command>(this._subcommands.ToArray());
        newSubcommands.Add(command);
        return new Command(
            this._id,
            this._name,
            this._description,
            this._isHidden,
            this._options,
            this._arguments,
            newSubcommands,
            this._handler,
        );
    }

    /**
     * Sets the handler for the command and returns a new instance.
     */
    public SetHandler(handler: CommandHandler): Command {
        return new Command(
            this._id,
            this._name,
            this._description,
            this._isHidden,
            this._options,
            this._arguments,
            this._subcommands,
            handler,
        );
    }

    /**
     * Sets whether the command is hidden and returns a new instance.
     */
    public SetHidden(isHidden: boolean): Command {
        return new Command(
            this._id,
            this._name,
            this._description,
            CsBoolean.From(isHidden),
            this._options,
            this._arguments,
            this._subcommands,
            this._handler,
        );
    }
}
