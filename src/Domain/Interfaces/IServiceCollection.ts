import {
    ServiceDescriptor,
    ServiceIdentifier,
    ImplementationFactory,
    Constructor,
} from "../DependencyInjection/ServiceDescriptor";
import { CsBoolean } from "../../System/Types";
import { IServiceProvider } from "./IServiceProvider";

export interface IServiceCollection extends Array<ServiceDescriptor> {
    Add(descriptor: ServiceDescriptor): IServiceCollection;

    AddSingleton<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): IServiceCollection;
    AddSingleton<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): IServiceCollection;
    AddSingleton<T>(serviceType: ServiceIdentifier<T>, instance: T): IServiceCollection;

    AddScoped<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): IServiceCollection;
    AddScoped<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): IServiceCollection;
    AddScoped<T>(serviceType: ServiceIdentifier<T>, instance: T): IServiceCollection;

    AddTransient<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): IServiceCollection;
    AddTransient<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): IServiceCollection;
    AddTransient<T>(serviceType: ServiceIdentifier<T>, instance: T): IServiceCollection;

    TryAddSingleton<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): CsBoolean;
    TryAddSingleton<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): CsBoolean;
    TryAddSingleton<T>(serviceType: ServiceIdentifier<T>, instance: T): CsBoolean;

    TryAddScoped<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): CsBoolean;
    TryAddScoped<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): CsBoolean;
    TryAddScoped<T>(serviceType: ServiceIdentifier<T>, instance: T): CsBoolean;

    TryAddTransient<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): CsBoolean;
    TryAddTransient<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): CsBoolean;
    TryAddTransient<T>(serviceType: ServiceIdentifier<T>, instance: T): CsBoolean;

    TryAdd(descriptor: ServiceDescriptor): CsBoolean;

    BuildServiceProvider(): IServiceProvider;
}
