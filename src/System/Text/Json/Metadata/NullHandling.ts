/**
 * Defines null handling behavior for JSON properties.
 */
export enum NullHandling {
    /**
     * Default behavior (Phase 4).
     * Typically includes nulls in JSON unless configured otherwise globally (though global config is limited).
     */
    Default = 0,

    /**
     * Skips the property entirely if the value is null.
     */
    Ignore = 1,

    /**
     * Throws a serialization/deserialization error if the value is null.
     */
    Disallow = 2,

    /**
     * Explicitly allows null, forcing it to be emitted even if defaults might say otherwise.
     */
    Allow = 3,
}
