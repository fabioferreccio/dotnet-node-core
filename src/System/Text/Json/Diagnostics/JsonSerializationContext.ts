import { Constructor } from "../Serialization/JsonConverter";

export interface JsonSerializationContext {
    TargetType: Constructor<unknown> | null;
    IsMetadataEnabled: boolean;
    Depth: number;
    NodeCount: number;
    StartTime: number;
    EndTime?: number;
}
